/**
 * Build-time prerender.
 *
 * Reads index.html and content/pages/home.json, finds the empty
 *   [data-offerings-list] and [data-faq-list] containers,
 * uses each section's <template> to render every item from the JSON,
 * and writes the result back to index.html.
 *
 * The script uses node-html-parser to *locate* the containers (so it works
 * regardless of whitespace and attribute order) and then splices new innerHTML
 * into the original source string — leaving the rest of the file byte-for-byte
 * unchanged. Idempotent: running it twice produces the same output.
 *
 * Wired into the Netlify build via `npm run build:netlify`. Locally you should
 * not need to run this — `npm run dev` uses content-loader.js to render at
 * runtime, so the source index.html stays editable.
 *
 * If you do run it locally and accidentally commit the result, just
 * `git checkout index.html` to restore the empty containers.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { parse } from "node-html-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const HTML_PATH = resolve(ROOT, "index.html");
const JSON_PATH = resolve(ROOT, "content/pages/home.json");

// Mirrors content-loader.js: keep these in sync if visual variants change.
const OFFERING_STYLE = {
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
    cta: ["bg-rose-900", "text-white", "hover:bg-rose-950"],
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

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(s) {
  return String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function nonEmpty(value) {
  return !!(value && String(value).trim());
}

// Set the inner content of a slot element using node-html-parser. Hides the
// element (adds 'hidden' class) when value is empty so editors can leave any
// optional field blank without leaving stray empty boxes in the layout.
function setSlot(node, slot, value, mode) {
  const el = node.querySelector(`[data-slot="${slot}"]`);
  if (!el) return null;
  if (nonEmpty(value)) {
    el.set_content(mode === "html" ? String(value) : escapeHtml(value));
    removeClass(el, "hidden");
  } else {
    el.set_content("");
    addClass(el, "hidden");
  }
  return el;
}

// node-html-parser doesn't ship a real classList; manage classes by string.
function getClasses(el) {
  return (el.getAttribute("class") || "").split(/\s+/).filter(Boolean);
}
function setClasses(el, classes) {
  if (classes.length === 0) el.removeAttribute("class");
  else el.setAttribute("class", classes.join(" "));
}
function addClass(el, ...names) {
  const cur = new Set(getClasses(el));
  names.forEach((n) => cur.add(n));
  setClasses(el, Array.from(cur));
}
function removeClass(el, name) {
  setClasses(
    el,
    getClasses(el).filter((c) => c !== name),
  );
}

function renderOfferingCard(templateHtml, card, sectionStyle, railLabel, slug, i) {
  const root = parse(templateHtml);
  const article = root.querySelector("article");
  if (!article) return "";

  const titleId = `offering-${slug}-${i}-title`;
  article.setAttribute("aria-labelledby", titleId);

  const img = root.querySelector('[data-slot="image"]');
  if (img) {
    img.setAttribute("src", escapeAttr(card.image || ""));
    img.setAttribute("alt", escapeAttr(card.imageAlt || ""));
  }

  const titleEl = setSlot(root, "title", card.title);
  if (titleEl) titleEl.setAttribute("id", titleId);

  const hasBadge = nonEmpty(card.badge);
  const badgeEl = root.querySelector('[data-slot="badge"]');
  if (badgeEl) {
    if (hasBadge) {
      badgeEl.set_content(escapeHtml(card.badge));
      removeClass(badgeEl, "hidden");
    } else {
      badgeEl.set_content("");
      addClass(badgeEl, "hidden");
    }
  }

  setSlot(root, "tagline", card.tagline);
  setSlot(root, "descriptionHtml", card.descriptionHtml, "html");
  setSlot(root, "railLabel", railLabel);
  setSlot(root, "pricePrimary", card.pricePrimary);
  setSlot(root, "priceSecondary", card.priceSecondary);

  const noteEl = setSlot(root, "priceNote", card.priceNote);
  if (
    noteEl &&
    nonEmpty(card.priceNote) &&
    (nonEmpty(card.priceSecondary) || nonEmpty(card.pricePrimary))
  ) {
    addClass(noteEl, "pt-2", "border-t", "border-stone-200/80");
  }

  setSlot(root, "ctaLabel", card.ctaLabel || "Inquire");

  const variant = hasBadge ? "featured" : "default";
  const taglineEl = root.querySelector('[data-slot="tagline"]');
  const priceEl = root.querySelector('[data-slot="pricePrimary"]');
  const ctaEl = root.querySelector('[data-slot="ctaLabel"]');
  if (taglineEl) addClass(taglineEl, ...OFFERING_STYLE[sectionStyle].tagline);
  if (priceEl) {
    addClass(priceEl, ...OFFERING_STYLE[sectionStyle].pricePrimary);
    addClass(priceEl, ...OFFERING_STYLE[variant].pricePrimary);
  }
  if (ctaEl) addClass(ctaEl, ...OFFERING_STYLE[variant].cta);

  return root.toString();
}

function renderFaqItem(templateHtml, item) {
  const root = parse(templateHtml);
  setSlot(root, "question", item.question);
  setSlot(root, "answerHtml", item.answerHtml, "html");
  return root.toString();
}

// Locate a container in the original source by parsing with node-html-parser
// and reusing the parsed node's range. Returns [openTagEnd, closeTagStart] —
// the inclusive innerHTML region — so we can splice without touching anything
// outside the container.
function findInnerRange(source, parsedRoot, selector) {
  const node = parsedRoot.querySelector(selector);
  if (!node || !node.range) return null;
  const [outerStart, outerEnd] = node.range;
  const openTagEnd = source.indexOf(">", outerStart);
  if (openTagEnd === -1 || openTagEnd >= outerEnd) return null;
  const closeTagStart = source.lastIndexOf("<", outerEnd - 1);
  if (closeTagStart === -1 || closeTagStart <= openTagEnd) return null;
  return [openTagEnd + 1, closeTagStart];
}

function getTemplateInnerHtml(parsedRoot, id) {
  const tpl = parsedRoot.querySelector(`template#${id}`);
  if (!tpl) throw new Error(`Missing <template id="${id}"> in index.html`);
  return tpl.innerHTML;
}

function getInnerIndent(source, openTagEnd) {
  // Use the next line's leading whitespace for inserted children, so the file
  // stays readable when someone opens the prerendered output.
  const nextNewline = source.indexOf("\n", openTagEnd);
  const lineStart = nextNewline === -1 ? openTagEnd : nextNewline + 1;
  let i = lineStart;
  while (i < source.length && (source[i] === " " || source[i] === "\t")) i++;
  return source.slice(lineStart, i);
}

function spliceInner(source, range, newInner, indent) {
  const [start, end] = range;
  const indented = newInner
    .split("\n")
    .map((line) => (line.length ? indent + line : line))
    .join("\n");
  return (
    source.slice(0, start) + "\n" + indented + "\n" + indent + source.slice(end)
  );
}

function main() {
  const source = readFileSync(HTML_PATH, "utf8");
  const data = JSON.parse(readFileSync(JSON_PATH, "utf8"));

  // Parse once for templates; re-parse before each splice so ranges always
  // reflect the current (possibly already-modified) source string.
  const initialDoc = parse(source, { comment: true });
  const offeringTemplate = getTemplateInnerHtml(initialDoc, "offering-card-template");
  const faqTemplate = getTemplateInnerHtml(initialDoc, "faq-item-template");

  const replacements = [];

  // Offerings — one entry per [data-offerings-list] container.
  ["individualCards", "groupCards"].forEach((listKey) => {
    const node = initialDoc.querySelector(`[data-offerings-list="${listKey}"]`);
    if (!node) {
      console.warn(`[prerender] no container for offeringsSection.${listKey} — skipping`);
      return;
    }
    const sectionStyle = node.getAttribute("data-section-style") || "individual";
    const railLabel = node.getAttribute("data-rail-label") || "Investment";
    const slug = listKey === "groupCards" ? "grp" : "ind";
    const cards = (data.offeringsSection && data.offeringsSection[listKey]) || [];

    const inner = cards
      .map((card, i) =>
        renderOfferingCard(offeringTemplate, card, sectionStyle, railLabel, slug, i).trim(),
      )
      .join("\n\n");

    replacements.push({
      selector: `[data-offerings-list="${listKey}"]`,
      inner,
      label: `offeringsSection.${listKey} (${cards.length} card${cards.length === 1 ? "" : "s"})`,
    });
  });

  // FAQ — one entry per [data-faq-list] container.
  const faqNode = initialDoc.querySelector("[data-faq-list]");
  if (faqNode) {
    const items = (data.faqSection && data.faqSection.items) || [];
    const inner = items.map((item) => renderFaqItem(faqTemplate, item).trim()).join("\n\n");
    replacements.push({
      selector: "[data-faq-list]",
      inner,
      label: `faqSection.items (${items.length} item${items.length === 1 ? "" : "s"})`,
    });
  } else {
    console.warn("[prerender] no [data-faq-list] container — skipping FAQ");
  }

  // Apply replacements one at a time, re-parsing each time so ranges are
  // always valid against the current source. Slower than batch-and-sort, but
  // robust and the file is tiny.
  let current = source;
  for (const r of replacements) {
    const doc = parse(current, { comment: true });
    const range = findInnerRange(current, doc, r.selector);
    if (!range) {
      throw new Error(`[prerender] could not locate container for ${r.selector}`);
    }
    const indent = getInnerIndent(current, range[0]);
    current = spliceInner(current, range, r.inner, indent);
    console.log(`[prerender] ${r.label}`);
  }

  if (current === source) {
    console.log("[prerender] no changes");
    return;
  }

  writeFileSync(HTML_PATH, current, "utf8");
  console.log(`[prerender] wrote ${HTML_PATH}`);
}

main();
