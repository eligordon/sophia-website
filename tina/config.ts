import { defineConfig } from "tinacms";

// TinaCloud indexes content per Git branch — must match the branch Netlify (or CI) is building.
// Netlify: BRANCH; Vercel: VERCEL_GIT_COMMIT_REF; GitHub Actions: GITHUB_REF_NAME / GITHUB_HEAD_REF.
const branch =
  process.env.GITHUB_BRANCH ||
  process.env.VERCEL_GIT_COMMIT_REF ||
  process.env.BRANCH ||
  process.env.HEAD ||
  "main";

export default defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    publicFolder: ".",
    outputFolder: "admin",
  },
  media: {
    tina: {
      publicFolder: ".",
      mediaRoot: "uploads",
    },
  },
  // Read-only preview iframe in /admin. MUST be stable across environments:
  // TinaCloud hashes your schema from GitHub without Netlify's env vars. Using
  // process.env.URL here breaks every Netlify build (local schema ≠ indexed schema).
  // When you add a custom domain, update this string and push.
  ui: {
    previewUrl: () => ({
      url: "https://fullcyclehealth.netlify.app",
    }),
  },
  schema: {
    collections: [
      {
        name: "home",
        label: "Home page",
        path: "content/pages",
        format: "json",
        match: {
          include: "home",
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false,
          },
          // No `router` here: that mode is for visual/contextual editing on the live
          // page (React + Tina field helpers). This site is static HTML + content-loader.js,
          // so editors use the standard sidebar form for content/pages/home.json instead.
        },
        fields: [
          {
            type: "object",
            name: "seo",
            label: "SEO",
            description:
              "Shown in browser tabs and search results. Aim for ~55–60 characters in the title and ~150–160 in the description.",
            fields: [
              { type: "string", name: "title", label: "Page title" },
              {
                type: "string",
                name: "description",
                label: "Meta description",
                ui: { component: "textarea" },
              },
            ],
          },
          {
            type: "object",
            name: "navigation",
            label: "Navigation labels",
            description: "Top navigation link text. Section anchors (#wisdom, #pathways, …) are fixed in the page.",
            fields: [
              { type: "string", name: "wisdom", label: "Wisdom" },
              { type: "string", name: "pathways", label: "Pathways" },
              { type: "string", name: "sophia", label: "Sophia" },
              { type: "string", name: "faq", label: "FAQ" },
              { type: "string", name: "getStarted", label: "Get started (desktop)" },
              {
                type: "string",
                name: "mobileOfferings",
                label: "Offerings (mobile)",
              },
            ],
          },
          {
            type: "object",
            name: "hero",
            label: "Hero",
            fields: [
              { type: "string", name: "eyebrow", label: "Eyebrow" },
              { type: "string", name: "headline", label: "Headline" },
              {
                type: "string",
                name: "paragraph1",
                label: "Lead paragraph",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "paragraph2",
                label: "Supporting paragraph",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "primaryCta",
                label: "Primary button",
                description: "Scrolls to the Offerings section.",
              },
              {
                type: "string",
                name: "secondaryCta",
                label: "Secondary button",
                description: "Uses the Contact → Booking URL or email if set; otherwise scrolls to the footer.",
              },
              {
                type: "image",
                name: "image",
                label: "Hero image",
                description: "Upload to /uploads or paste a full https:// URL.",
              },
              { type: "string", name: "imageAlt", label: "Hero image alt", description: "Describe the image for screen readers." },
            ],
          },
          {
            type: "object",
            name: "wisdom",
            label: "Wisdom section",
            fields: [
              {
                type: "image",
                name: "image",
                label: "Image",
                description: "Upload to /uploads or paste a full https:// URL.",
              },
              { type: "string", name: "imageAlt", label: "Image alt" },
              { type: "string", name: "eyebrow", label: "Eyebrow" },
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "body1Html",
                label: "First paragraph (HTML allowed)",
                description: "You can use simple HTML tags like <em>, <strong>, and <a href=\"…\">.",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "body2",
                label: "Second paragraph",
                ui: { component: "textarea" },
              },
              { type: "string", name: "quote", label: "Quote" },
              { type: "string", name: "quoteAttribution", label: "Quote attribution" },
            ],
          },
          {
            type: "object",
            name: "pathwaysSection",
            label: "Pathways section",
            fields: [
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "intro",
                label: "Intro",
                ui: { component: "textarea" },
              },
              {
                type: "object",
                name: "pathways",
                label: "Pathway cards",
                description:
                  "The page renders exactly four cards in a 2×2 / row-of-four grid. Adding more or fewer will break the layout.",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Pathway",
                  }),
                },
                fields: [
                  {
                    type: "image",
                    name: "image",
                    label: "Image",
                    description: "Upload to /uploads or paste a full https:// URL.",
                  },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  { type: "string", name: "tag", label: "Tag" },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "description",
                    label: "Description",
                    ui: { component: "textarea" },
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "about",
            label: "About (Sophia)",
            fields: [
              {
                type: "image",
                name: "profileImage",
                label: "Profile image",
                description: "Upload to /uploads or paste a full https:// URL. Portrait orientation works best (4:5).",
              },
              { type: "string", name: "profileImageAlt", label: "Profile image alt" },
              { type: "string", name: "name", label: "Name" },
              { type: "string", name: "role", label: "Role" },
              { type: "string", name: "location", label: "Location" },
              { type: "string", name: "eyebrow", label: "Eyebrow" },
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "bio1",
                label: "Bio paragraph 1",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "bio2",
                label: "Bio paragraph 2",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "trainingHtml",
                label: "Training & credentials (HTML)",
                description:
                  "Wrap each paragraph in <p>…</p>. Links use <a href=\"https://…\">label</a>; non-breaking spaces are &nbsp;.",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "pullQuote",
                label: "Pull quote",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "values",
                label: "Shared values",
                description: "One value per item. Use the buttons to add, reorder, or remove items.",
                list: true,
              },
              {
                type: "string",
                name: "valuesFooter",
                label: "Values box footer",
                ui: { component: "textarea" },
              },
            ],
          },
          {
            type: "object",
            name: "faqSection",
            label: "FAQ section",
            fields: [
              { type: "string", name: "heading", label: "Heading" },
              { type: "string", name: "intro", label: "Intro" },
              {
                type: "object",
                name: "items",
                label: "Questions",
                description: "Add, reorder, or remove FAQ items as needed.",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.question || "FAQ item",
                  }),
                },
                fields: [
                  { type: "string", name: "question", label: "Question" },
                  {
                    type: "string",
                    name: "answerHtml",
                    label: "Answer (HTML)",
                    description:
                      "Wrap paragraphs in <p>…</p>. You can use <strong>, <em>, and <a href=\"…\">.",
                    ui: { component: "textarea" },
                  },
                ],
              },
            ],
          },
          {
            type: "object",
            name: "offeringsSection",
            label: "Offerings section",
            fields: [
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "individualIntro",
                label: "Intro (individuals)",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "groupIntro",
                label: "Intro (organizations & groups)",
                ui: { component: "textarea" },
              },
              {
                type: "object",
                name: "individualCards",
                label: "Individual offerings",
                description:
                  "The page renders exactly two individual offerings. Reorder freely; adding a third will not appear on the page until the layout is updated.",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Offering",
                  }),
                },
                fields: [
                  {
                    type: "image",
                    name: "image",
                    label: "Image",
                    description: "Upload to /uploads or paste a full https:// URL.",
                  },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  {
                    type: "string",
                    name: "badge",
                    label: "Badge (optional)",
                    description: "e.g. \"Active Enrollment\". Leave blank to hide the badge.",
                  },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "tagline",
                    label: "Tagline",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "descriptionHtml",
                    label: "Description (HTML)",
                    description:
                      "Wrap paragraphs in <p>…</p>. You can use <em>, <strong>, and <abbr title=\"…\">.",
                    ui: { component: "textarea" },
                  },
                  { type: "string", name: "pricePrimary", label: "Price (primary line)" },
                  {
                    type: "string",
                    name: "priceSecondary",
                    label: "Price (secondary line, optional)",
                  },
                  {
                    type: "string",
                    name: "priceNote",
                    label: "Price note / payment plan (optional)",
                  },
                  { type: "string", name: "ctaLabel", label: "Button label" },
                ],
              },
              {
                type: "object",
                name: "groupCards",
                label: "Group & workshop offerings",
                description:
                  "The page renders exactly three group offerings. Reorder freely; adding a fourth will not appear on the page until the layout is updated.",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Offering",
                  }),
                },
                fields: [
                  {
                    type: "image",
                    name: "image",
                    label: "Image",
                    description: "Upload to /uploads or paste a full https:// URL.",
                  },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  {
                    type: "string",
                    name: "badge",
                    label: "Badge (optional)",
                    description: "e.g. \"Active Enrollment\". Leave blank to hide the badge.",
                  },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "tagline",
                    label: "Tagline",
                    ui: { component: "textarea" },
                  },
                  {
                    type: "string",
                    name: "descriptionHtml",
                    label: "Description (HTML)",
                    description:
                      "Wrap paragraphs in <p>…</p>. You can use <em>, <strong>, and <abbr title=\"…\">.",
                    ui: { component: "textarea" },
                  },
                  { type: "string", name: "pricePrimary", label: "Price (primary line)" },
                  {
                    type: "string",
                    name: "priceSecondary",
                    label: "Price (secondary line, optional)",
                  },
                  {
                    type: "string",
                    name: "priceNote",
                    label: "Price note (optional)",
                  },
                  { type: "string", name: "ctaLabel", label: "Button label" },
                ],
              },
              { type: "string", name: "footerLine2", label: "Footer line (trades)" },
            ],
          },
          {
            type: "object",
            name: "contact",
            label: "Contact & booking",
            description:
              "Destinations for every Get-in-touch / Book / Inquire / Register button. Set the Booking URL (Calendly, Cal.com, Tally, etc.) OR an email — whichever is set takes priority. If both are blank, buttons fall back to scrolling to the footer.",
            fields: [
              {
                type: "string",
                name: "bookingUrl",
                label: "Booking URL",
                description:
                  "Full https:// link (e.g. Calendly). Used by the hero \"Get in touch\" button, every offering CTA, and the footer \"Book My Discovery Call\" button.",
              },
              {
                type: "string",
                name: "email",
                label: "Contact email",
                description: "Used as a mailto: fallback if no booking URL is set.",
              },
            ],
          },
          {
            type: "object",
            name: "footer",
            label: "Footer",
            fields: [
              {
                type: "string",
                name: "mission",
                label: "Mission line",
                ui: { component: "textarea" },
              },
              { type: "string", name: "location", label: "Location line" },
              { type: "string", name: "locationSub", label: "Location subline" },
              {
                type: "string",
                name: "ctaHeadline",
                label: "CTA headline",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "ctaButton",
                label: "CTA button",
                description: "Uses the Contact → Booking URL or email if set; otherwise scrolls to the footer.",
              },
              {
                type: "string",
                name: "copyrightAfterYear",
                label: "Copyright (after year)",
              },
              { type: "string", name: "tagline", label: "Bottom tagline" },
            ],
          },
        ],
      },
    ],
  },
});
