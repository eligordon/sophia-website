// tina/config.ts
import { defineConfig } from "tinacms";
var branch = process.env.GITHUB_BRANCH || process.env.VERCEL_GIT_COMMIT_REF || process.env.BRANCH || process.env.HEAD || "main";
var config_default = defineConfig({
  branch,
  clientId: process.env.NEXT_PUBLIC_TINA_CLIENT_ID || "",
  token: process.env.TINA_TOKEN || "",
  build: {
    publicFolder: ".",
    outputFolder: "admin"
  },
  media: {
    tina: {
      publicFolder: ".",
      mediaRoot: "uploads"
    }
  },
  // Read-only preview iframe in /admin. MUST be stable across environments:
  // TinaCloud hashes your schema from GitHub without Netlify's env vars. Using
  // process.env.URL here breaks every Netlify build (local schema ≠ indexed schema).
  // When you add a custom domain, update this string and push.
  ui: {
    previewUrl: () => ({
      url: "https://fullcyclehealth.netlify.app"
    })
  },
  schema: {
    collections: [
      {
        name: "home",
        label: "Home page",
        path: "content/pages",
        format: "json",
        match: {
          include: "home"
        },
        ui: {
          allowedActions: {
            create: false,
            delete: false
          }
          // No `router` here: that mode is for visual/contextual editing on the live
          // page (React + Tina field helpers). This site is static HTML + content-loader.js,
          // so editors use the standard sidebar form for content/pages/home.json instead.
        },
        fields: [
          {
            type: "object",
            name: "seo",
            label: "SEO",
            fields: [
              { type: "string", name: "title", label: "Page title" },
              {
                type: "string",
                name: "description",
                label: "Meta description",
                ui: { component: "textarea" }
              }
            ]
          },
          {
            type: "object",
            name: "navigation",
            label: "Navigation labels",
            fields: [
              { type: "string", name: "wisdom", label: "Wisdom" },
              { type: "string", name: "pathways", label: "Pathways" },
              { type: "string", name: "sophia", label: "Sophia" },
              { type: "string", name: "faq", label: "FAQ" },
              { type: "string", name: "getStarted", label: "Get started (desktop)" },
              {
                type: "string",
                name: "mobileOfferings",
                label: "Offerings (mobile)"
              }
            ]
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
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "paragraph2",
                label: "Supporting paragraph",
                ui: { component: "textarea" }
              },
              { type: "string", name: "primaryCta", label: "Primary button" },
              { type: "string", name: "secondaryCta", label: "Secondary button" },
              { type: "string", name: "image", label: "Hero image URL" },
              { type: "string", name: "imageAlt", label: "Hero image alt" }
            ]
          },
          {
            type: "object",
            name: "wisdom",
            label: "Wisdom section",
            fields: [
              { type: "string", name: "image", label: "Image URL" },
              { type: "string", name: "imageAlt", label: "Image alt" },
              { type: "string", name: "eyebrow", label: "Eyebrow" },
              { type: "string", name: "heading", label: "Heading" },
              {
                type: "string",
                name: "body1Html",
                label: "First paragraph (HTML allowed)",
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "body2",
                label: "Second paragraph",
                ui: { component: "textarea" }
              },
              { type: "string", name: "quote", label: "Quote" },
              { type: "string", name: "quoteAttribution", label: "Quote attribution" }
            ]
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
                ui: { component: "textarea" }
              },
              {
                type: "object",
                name: "pathways",
                label: "Pathway cards",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Pathway"
                  })
                },
                fields: [
                  { type: "string", name: "image", label: "Image URL" },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  { type: "string", name: "tag", label: "Tag" },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "description",
                    label: "Description",
                    ui: { component: "textarea" }
                  }
                ]
              }
            ]
          },
          {
            type: "object",
            name: "about",
            label: "About (Sophia)",
            fields: [
              { type: "string", name: "profileImage", label: "Profile image URL" },
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
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "bio2",
                label: "Bio paragraph 2",
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "trainingHtml",
                label: "Training & credentials (HTML)",
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "pullQuote",
                label: "Pull quote",
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "values",
                label: "Shared values (one per line in UI)",
                list: true
              },
              {
                type: "string",
                name: "valuesFooter",
                label: "Values box footer",
                ui: { component: "textarea" }
              }
            ]
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
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.question || "FAQ item"
                  })
                },
                fields: [
                  { type: "string", name: "question", label: "Question" },
                  {
                    type: "string",
                    name: "answerHtml",
                    label: "Answer (HTML)",
                    ui: { component: "textarea" }
                  }
                ]
              }
            ]
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
                ui: { component: "textarea" }
              },
              {
                type: "string",
                name: "groupIntro",
                label: "Intro (organizations & groups)",
                ui: { component: "textarea" }
              },
              {
                type: "object",
                name: "individualCards",
                label: "Individual offerings",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Offering"
                  })
                },
                fields: [
                  { type: "string", name: "image", label: "Image URL" },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  {
                    type: "string",
                    name: "badge",
                    label: "Badge (optional)"
                  },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "tagline",
                    label: "Tagline",
                    ui: { component: "textarea" }
                  },
                  {
                    type: "string",
                    name: "descriptionHtml",
                    label: "Description (HTML)",
                    ui: { component: "textarea" }
                  },
                  { type: "string", name: "pricePrimary", label: "Price (primary line)" },
                  {
                    type: "string",
                    name: "priceSecondary",
                    label: "Price (secondary line, optional)"
                  },
                  {
                    type: "string",
                    name: "priceNote",
                    label: "Price note / payment plan (optional)"
                  },
                  { type: "string", name: "ctaLabel", label: "Button label" }
                ]
              },
              {
                type: "object",
                name: "groupCards",
                label: "Group & workshop offerings",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Offering"
                  })
                },
                fields: [
                  { type: "string", name: "image", label: "Image URL" },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  {
                    type: "string",
                    name: "badge",
                    label: "Badge (optional)"
                  },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "tagline",
                    label: "Tagline",
                    ui: { component: "textarea" }
                  },
                  {
                    type: "string",
                    name: "descriptionHtml",
                    label: "Description (HTML)",
                    ui: { component: "textarea" }
                  },
                  { type: "string", name: "pricePrimary", label: "Price (primary line)" },
                  {
                    type: "string",
                    name: "priceSecondary",
                    label: "Price (secondary line, optional)"
                  },
                  {
                    type: "string",
                    name: "priceNote",
                    label: "Price note (optional)"
                  },
                  { type: "string", name: "ctaLabel", label: "Button label" }
                ]
              },
              { type: "string", name: "footerLine2", label: "Footer line (trades)" }
            ]
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
                ui: { component: "textarea" }
              },
              { type: "string", name: "location", label: "Location line" },
              { type: "string", name: "locationSub", label: "Location subline" },
              {
                type: "string",
                name: "ctaHeadline",
                label: "CTA headline",
                ui: { component: "textarea" }
              },
              { type: "string", name: "ctaButton", label: "CTA button" },
              {
                type: "string",
                name: "copyrightAfterYear",
                label: "Copyright (after year)"
              },
              { type: "string", name: "tagline", label: "Bottom tagline" }
            ]
          }
        ]
      }
    ]
  }
});
export {
  config_default as default
};
