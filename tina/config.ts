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
          router: () => "/",
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
                ui: { component: "textarea" },
              },
            ],
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
              { type: "string", name: "primaryCta", label: "Primary button" },
              { type: "string", name: "secondaryCta", label: "Secondary button" },
              { type: "string", name: "image", label: "Hero image URL" },
              { type: "string", name: "imageAlt", label: "Hero image alt" },
            ],
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
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Pathway",
                  }),
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
                name: "pullQuote",
                label: "Pull quote",
                ui: { component: "textarea" },
              },
              {
                type: "string",
                name: "values",
                label: "Shared values (one per line in UI)",
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
                name: "intro",
                label: "Intro",
                ui: { component: "textarea" },
              },
              {
                type: "object",
                name: "cards",
                label: "Offering cards",
                list: true,
                ui: {
                  itemProps: (item) => ({
                    label: item?.title || "Offering",
                  }),
                },
                fields: [
                  { type: "string", name: "image", label: "Image URL" },
                  { type: "string", name: "imageAlt", label: "Image alt" },
                  {
                    type: "string",
                    name: "badge",
                    label: "Badge (optional)",
                  },
                  { type: "string", name: "title", label: "Title" },
                  {
                    type: "string",
                    name: "subtitle",
                    label: "Subtitle",
                    ui: { component: "textarea" },
                  },
                  { type: "string", name: "price", label: "Price line" },
                  {
                    type: "string",
                    name: "priceNote",
                    label: "Price note (optional)",
                  },
                  { type: "string", name: "ctaLabel", label: "Button label" },
                ],
              },
              {
                type: "string",
                name: "footerLine1",
                label: "Footer line (workshops)",
                ui: { component: "textarea" },
              },
              { type: "string", name: "footerLine2", label: "Footer line (trades)" },
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
              { type: "string", name: "ctaButton", label: "CTA button" },
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
