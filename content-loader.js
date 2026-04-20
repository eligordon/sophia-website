/**
 * Applies Tina-managed JSON from content/pages/home.json to the page.
 * Run the site from the project root (e.g. npm run dev) so this path resolves.
 */
(function () {
  function get(obj, path) {
    if (!path || !obj) return undefined;
    const parts = path.split(".");
    let cur = obj;
    for (const p of parts) {
      if (cur == null) return undefined;
      const idx = Number(p);
      if (String(idx) === p && Number.isInteger(idx)) cur = cur[idx];
      else cur = cur[p];
    }
    return cur;
  }

  function applyText(root, path, value) {
    if (value == null) return;
    root.querySelectorAll('[data-tina="' + path + '"]').forEach(function (el) {
      if (el.tagName === "IMG") el.src = value;
      else el.textContent = value;
    });
  }

  function applyHtml(root, path, value) {
    if (value == null) return;
    root.querySelectorAll('[data-tina-html="' + path + '"]').forEach(function (el) {
      el.innerHTML = value;
    });
  }

  function applyAlt(root, path, value) {
    if (value == null) return;
    root.querySelectorAll('[data-tina-alt="' + path + '"]').forEach(function (el) {
      if (el.tagName === "IMG") el.alt = value;
    });
  }

  function applyPlaceholder(root, path, value) {
    if (value == null) return;
    root.querySelectorAll('[data-tina-placeholder="' + path + '"]').forEach(function (el) {
      el.setAttribute("placeholder", value);
    });
  }

  // Populate a <select data-tina-options="path"> with options from the array
  // at `path`. Preserves any existing first <option> that has both
  // [disabled] and [value=""] (the "Choose one…" placeholder), and updates
  // its label from data-tina-placeholder-option if set.
  function applySelectOptions(root, data) {
    root.querySelectorAll("[data-tina-options]").forEach(function (select) {
      if (select.tagName !== "SELECT") return;
      var path = select.getAttribute("data-tina-options");
      var options = get(data, path);
      if (!Array.isArray(options)) return;

      var placeholderPath = select.getAttribute("data-tina-placeholder-option");
      var placeholderText = placeholderPath ? get(data, placeholderPath) : null;

      var firstOpt = select.querySelector('option[disabled][value=""]');
      select.textContent = "";
      if (firstOpt) {
        if (placeholderText != null) firstOpt.textContent = placeholderText;
        select.appendChild(firstOpt);
      }
      options.forEach(function (label) {
        if (label == null || String(label).trim() === "") return;
        var opt = document.createElement("option");
        opt.textContent = label;
        select.appendChild(opt);
      });
    });
  }

  // Visual variants applied to a cloned offering card.
  // Driven by the section ("individual" vs "group") and whether the card has
  // a badge set ("featured" vs "default"). Keeping the rules here means the
  // template's classes stay layout-only and editors don't need to know CSS.
  var OFFERING_STYLE = {
    individual: {
      tagline: ["text-rose-800/90"],
      pricePrimary: ["text-2xl", "sm:text-3xl"],
    },
    group: {
      tagline: ["text-stone-600"],
      pricePrimary: ["text-xl", "sm:text-2xl"],
    },
    featured: {
      pricePrimary: ["text-rose-950"],
      cta: [
        "bg-rose-900",
        "text-white",
        "hover:bg-rose-950",
      ],
    },
    default: {
      pricePrimary: ["text-stone-900"],
      cta: [
        "border",
        "border-stone-400",
        "text-stone-800",
        "bg-white",
        "hover:bg-stone-50",
        "hover:border-stone-500",
      ],
    },
  };

  function setSlotText(card, slot, value) {
    var el = card.querySelector('[data-slot="' + slot + '"]');
    if (!el) return null;
    if (value && String(value).trim()) {
      el.textContent = value;
      el.classList.remove("hidden");
    } else {
      el.textContent = "";
      el.classList.add("hidden");
    }
    return el;
  }

  function setSlotHtml(card, slot, value) {
    var el = card.querySelector('[data-slot="' + slot + '"]');
    if (!el) return null;
    if (value && String(value).trim()) {
      el.innerHTML = value;
      el.classList.remove("hidden");
    } else {
      el.innerHTML = "";
      el.classList.add("hidden");
    }
    return el;
  }

  function renderOfferings(root, data) {
    var template = root.getElementById
      ? root.getElementById("offering-card-template")
      : document.getElementById("offering-card-template");
    if (!template || !template.content) return;

    root.querySelectorAll("[data-offerings-list]").forEach(function (container) {
      // Skip if the build pre-rendered cards into this container already.
      if (container.firstElementChild) return;

      var listKey = container.getAttribute("data-offerings-list");
      var sectionStyle = container.getAttribute("data-section-style") || "individual";
      var railLabel = container.getAttribute("data-rail-label") || "Investment";
      var slug = listKey === "groupCards" ? "grp" : "ind";
      var cards = get(data, "offeringsSection." + listKey) || [];

      container.textContent = "";

      cards.forEach(function (card, i) {
        var clone = template.content.cloneNode(true);
        var article = clone.querySelector("article");
        if (!article) return;

        var titleId = "offering-" + slug + "-" + i + "-title";
        article.setAttribute("aria-labelledby", titleId);

        var img = article.querySelector('[data-slot="image"]');
        if (img) {
          img.setAttribute("src", card.image || "");
          img.setAttribute("alt", card.imageAlt || "");
        }

        var titleEl = setSlotText(article, "title", card.title);
        if (titleEl) titleEl.id = titleId;

        var hasBadge = !!(card.badge && String(card.badge).trim());
        var badgeEl = article.querySelector('[data-slot="badge"]');
        if (badgeEl) {
          if (hasBadge) {
            badgeEl.textContent = card.badge;
            badgeEl.classList.remove("hidden");
          } else {
            badgeEl.textContent = "";
            badgeEl.classList.add("hidden");
          }
        }

        setSlotText(article, "tagline", card.tagline);
        setSlotHtml(article, "descriptionHtml", card.descriptionHtml);
        setSlotText(article, "railLabel", railLabel);
        setSlotText(article, "pricePrimary", card.pricePrimary);
        setSlotText(article, "priceSecondary", card.priceSecondary);

        var hasNote = !!(card.priceNote && String(card.priceNote).trim());
        var hasSecondary = !!(card.priceSecondary && String(card.priceSecondary).trim());
        var hasPrimary = !!(card.pricePrimary && String(card.pricePrimary).trim());
        var noteEl = setSlotText(article, "priceNote", card.priceNote);
        // Add a divider above the note only when it visually separates two lines.
        if (noteEl && hasNote && (hasSecondary || hasPrimary)) {
          noteEl.classList.add("pt-2", "border-t", "border-stone-200/80");
        }

        setSlotText(article, "ctaLabel", card.ctaLabel || "Inquire");

        // Apply the section + variant classes after the slot helpers run, so
        // the variant styles are always present (slot helpers don't touch them).
        var variant = hasBadge ? "featured" : "default";
        var taglineEl = article.querySelector('[data-slot="tagline"]');
        var priceEl = article.querySelector('[data-slot="pricePrimary"]');
        var ctaEl = article.querySelector('[data-slot="ctaLabel"]');
        if (taglineEl) taglineEl.classList.add.apply(taglineEl.classList, OFFERING_STYLE[sectionStyle].tagline);
        if (priceEl) {
          priceEl.classList.add.apply(priceEl.classList, OFFERING_STYLE[sectionStyle].pricePrimary);
          priceEl.classList.add.apply(priceEl.classList, OFFERING_STYLE[variant].pricePrimary);
        }
        if (ctaEl) ctaEl.classList.add.apply(ctaEl.classList, OFFERING_STYLE[variant].cta);

        container.appendChild(clone);
      });
    });
  }

  function renderFaqItems(root, data) {
    var template = document.getElementById("faq-item-template");
    if (!template || !template.content) return;

    root.querySelectorAll("[data-faq-list]").forEach(function (container) {
      // Skip if the build pre-rendered items into this container already.
      if (container.firstElementChild) return;

      var items = get(data, "faqSection.items") || [];
      container.textContent = "";

      items.forEach(function (item) {
        var clone = template.content.cloneNode(true);
        setSlotText(clone, "question", item.question);
        setSlotHtml(clone, "answerHtml", item.answerHtml);
        container.appendChild(clone);
      });
    });
  }

  // Resolve every CTA marked data-tina-href="contact" to the editable
  // bookingUrl (preferred) or mailto:email. If neither is set, the existing
  // anchor (#contact — the on-page contact form) is kept as a fallback.
  function applyContactLinks(root, data) {
    var bookingUrl = (get(data, "contact.bookingUrl") || "").trim();
    var email = (get(data, "contact.email") || "").trim();
    var href = bookingUrl || (email ? "mailto:" + email : "");
    if (!href) return;
    var external = /^https?:\/\//i.test(href);
    root.querySelectorAll('[data-tina-href="contact"]').forEach(function (el) {
      el.setAttribute("href", href);
      if (external) {
        el.setAttribute("target", "_blank");
        el.setAttribute("rel", "noopener noreferrer");
      } else {
        el.removeAttribute("target");
        el.removeAttribute("rel");
      }
    });
  }

  fetch("content/pages/home.json")
    .then(function (r) {
      if (!r.ok) throw new Error(r.statusText);
      return r.json();
    })
    .then(function (data) {
      window.__siteContent = data;
      var root = document;

      var title = get(data, "seo.title");
      if (title) document.title = title;
      var meta = document.querySelector('meta[name="description"]');
      var desc = get(data, "seo.description");
      if (meta && desc) meta.setAttribute("content", desc);

      [
        ["navigation.wisdom"],
        ["navigation.pathways"],
        ["navigation.sophia"],
        ["navigation.faq"],
        ["navigation.getStarted"],
        ["navigation.mobileOfferings"],
      ].forEach(function (a) {
        applyText(root, a[0], get(data, a[0]));
      });

      [
        "hero.eyebrow",
        "hero.headline",
        "hero.paragraph1",
        "hero.paragraph2",
        "hero.primaryCta",
        "hero.secondaryCta",
      ].forEach(function (p) {
        applyText(root, p, get(data, p));
      });
      applyText(root, "hero.image", get(data, "hero.image"));
      applyAlt(root, "hero.imageAlt", get(data, "hero.imageAlt"));

      applyText(root, "wisdom.image", get(data, "wisdom.image"));
      applyAlt(root, "wisdom.imageAlt", get(data, "wisdom.imageAlt"));
      [
        "wisdom.eyebrow",
        "wisdom.heading",
        "wisdom.body2",
        "wisdom.quote",
        "wisdom.quoteAttribution",
      ].forEach(function (p) {
        applyText(root, p, get(data, p));
      });
      applyHtml(root, "wisdom.body1Html", get(data, "wisdom.body1Html"));

      applyText(root, "pathwaysSection.heading", get(data, "pathwaysSection.heading"));
      applyText(root, "pathwaysSection.intro", get(data, "pathwaysSection.intro"));

      var pathways = get(data, "pathwaysSection.pathways") || [];
      pathways.forEach(function (_, i) {
        var base = "pathwaysSection.pathways." + i;
        applyText(root, base + ".image", get(data, base + ".image"));
        applyAlt(root, base + ".imageAlt", get(data, base + ".imageAlt"));
        ["tag", "title", "description"].forEach(function (f) {
          applyText(root, base + "." + f, get(data, base + "." + f));
        });
      });

      [
        "about.profileImage",
        "about.name",
        "about.role",
        "about.location",
        "about.eyebrow",
        "about.heading",
        "about.bio1",
        "about.bio2",
        "about.pullQuote",
        "about.valuesFooter",
      ].forEach(function (p) {
        applyText(root, p, get(data, p));
      });
      applyHtml(root, "about.trainingHtml", get(data, "about.trainingHtml"));
      applyAlt(root, "about.profileImageAlt", get(data, "about.profileImageAlt"));
      applyText(root, "about.profileImage", get(data, "about.profileImage"));

      var values = get(data, "about.values") || [];
      values.forEach(function (v, i) {
        applyText(root, "about.values." + i, v);
      });

      applyText(root, "faqSection.heading", get(data, "faqSection.heading"));
      applyText(root, "faqSection.intro", get(data, "faqSection.intro"));
      renderFaqItems(root, data);

      applyText(root, "offeringsSection.heading", get(data, "offeringsSection.heading"));
      applyText(root, "offeringsSection.individualIntro", get(data, "offeringsSection.individualIntro"));
      applyText(root, "offeringsSection.groupIntro", get(data, "offeringsSection.groupIntro"));
      applyText(root, "offeringsSection.footerLine2", get(data, "offeringsSection.footerLine2"));

      renderOfferings(root, data);

      [
        "contactSection.eyebrow",
        "contactSection.heading",
        "contactSection.intro",
        "contactSection.nameLabel",
        "contactSection.emailLabel",
        "contactSection.topicLabel",
        "contactSection.messageLabel",
        "contactSection.submitLabel",
        "contactSection.reassurance",
        "contactSection.successHeadline",
        "contactSection.successBody",
      ].forEach(function (p) {
        applyText(root, p, get(data, p));
      });
      [
        "contactSection.namePlaceholder",
        "contactSection.emailPlaceholder",
        "contactSection.messagePlaceholder",
      ].forEach(function (p) {
        applyPlaceholder(root, p, get(data, p));
      });
      applySelectOptions(root, data);

      [
        "footer.mission",
        "footer.location",
        "footer.locationSub",
        "footer.copyrightAfterYear",
        "footer.tagline",
      ].forEach(function (p) {
        applyText(root, p, get(data, p));
      });

      applyContactLinks(root, data);
    })
    .catch(function (e) {
      console.warn("[content-loader] Could not load content/pages/home.json:", e.message);
    });
})();
