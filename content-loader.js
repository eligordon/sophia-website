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

  function applyBadge(root, path) {
    root.querySelectorAll("[data-tina-badge]").forEach(function (el) {
      if (el.getAttribute("data-tina-badge") !== path) return;
      var value = get(window.__siteContent, path);
      if (!value) {
        el.classList.add("hidden");
        return;
      }
      el.classList.remove("hidden");
      el.textContent = value;
    });
  }

  // Resolve every CTA marked data-tina-href="contact" to the editable
  // bookingUrl (preferred) or mailto:email. If neither is set, the existing
  // anchor (#footer-contact / #book-discovery-call) is kept as a fallback.
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
      var faqs = get(data, "faqSection.items") || [];
      faqs.forEach(function (_, i) {
        var base = "faqSection.items." + i;
        applyText(root, base + ".question", get(data, base + ".question"));
        applyHtml(root, base + ".answerHtml", get(data, base + ".answerHtml"));
      });

      applyText(root, "offeringsSection.heading", get(data, "offeringsSection.heading"));
      applyText(root, "offeringsSection.individualIntro", get(data, "offeringsSection.individualIntro"));
      applyText(root, "offeringsSection.groupIntro", get(data, "offeringsSection.groupIntro"));
      applyText(root, "offeringsSection.footerLine2", get(data, "offeringsSection.footerLine2"));

      function applyOfferingCards(listKey) {
        var cards = get(data, "offeringsSection." + listKey) || [];
        cards.forEach(function (_, i) {
          var base = "offeringsSection." + listKey + "." + i;
          applyText(root, base + ".image", get(data, base + ".image"));
          applyAlt(root, base + ".imageAlt", get(data, base + ".imageAlt"));
          [
            "title",
            "tagline",
            "pricePrimary",
            "priceSecondary",
            "priceNote",
            "ctaLabel",
          ].forEach(function (f) {
            applyText(root, base + "." + f, get(data, base + "." + f));
          });
          applyHtml(root, base + ".descriptionHtml", get(data, base + ".descriptionHtml"));
          applyBadge(root, base + ".badge");
        });
      }

      applyOfferingCards("individualCards");
      applyOfferingCards("groupCards");

      [
        "footer.mission",
        "footer.location",
        "footer.locationSub",
        "footer.ctaHeadline",
        "footer.ctaButton",
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
