# Optional integrations

The template works without any of these. Add them per project when there is a need.

- [Contact form](#contact-form)
- [CMS for client editing](#cms-for-client-editing)
- [Analytics](#analytics)
- [Fonts](#fonts)
- [Multiple languages](#multiple-languages)
- [React components](#react-components)

## Contact form

By default the contact page shows email, phone, and address only. The form is built in but switched off, because a working form needs three things a static site doesn't have:

1. **A server route.** The form posts to `/api/contact`, which runs on demand, so the host needs a server [adapter](https://docs.astro.build/en/guides/on-demand-rendering/). All other pages stay static.
2. **A delivery service** that receives the messages: [Resend](https://resend.com/) (email) or any **webhook** URL (Slack, Zapier, Make, n8n, your own API). There is no silent fallback: without configuration the endpoint answers 503 and logs an error.
3. **Spam protection.** Always on: a hidden honeypot field and a minimum fill time (3 s). Recommended for production: [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/), which is verified on the server when its secret is set.

Validation happens on the server (`src/lib/contact/validate.ts`): required fields, email format, and length limits. Cross-origin form posts are rejected by Astro's built-in origin check. The form works without JavaScript (normal POST, then redirect to `/contact/sent/`); with JavaScript it submits in place and shows field errors.

### Enable it

1. Add the adapter for your host, e.g. for Netlify: `npx astro add netlify` (Node server: `@astrojs/node`, Cloudflare: `@astrojs/cloudflare`, Vercel: `@astrojs/vercel`). Keep `output: 'static'` in `astro.config.ts`.
2. Rename `src/pages/api/_contact.ts` to `src/pages/api/contact.ts` (files starting with `_` are not routed).
3. Set `contactForm.enabled: true` in `src/site.config.ts`. The build fails with a message if step 2 is missing.
4. Set environment variables locally in `.env` and in production in the host's dashboard (see `.env.example`):

   | Variable                                                   | Needed for                                            |
   | ---------------------------------------------------------- | ----------------------------------------------------- |
   | `CONTACT_DELIVERY`                                         | `resend` or `webhook`                                 |
   | `CONTACT_WEBHOOK_URL`                                      | webhook delivery                                      |
   | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` | Resend delivery (sender must be on a verified domain) |
   | `PUBLIC_TURNSTILE_SITE_KEY`, `TURNSTILE_SECRET_KEY`        | Turnstile (both, or neither)                          |

   `PUBLIC_TURNSTILE_SITE_KEY` is read at build time, so rebuild after setting it. Other variables are read at runtime.

5. Test: `npm run build && npm run preview`, submit the form, and confirm the message arrives. `npm run test:unit` covers validation, spam checks, and delivery with a fake network.

### Change it

- Fields: update the form in `src/components/ContactForm.astro`, validation in `src/lib/contact/validate.ts`, and the unit tests together.
- Another delivery service: add a case in `src/lib/contact/deliver.ts` and `deliveryFromEnv` in `handler.ts`, and declare its variables in `astro.config.ts` (`env.schema`) and `.env.example`.
- Hosted form services (Formspree, Netlify Forms, and similar) are an alternative that keeps the site fully static; point the form `action` at the service and follow its spam-protection options. Delete `src/pages/api/_contact.ts` and `src/lib/contact/` if you go this way.

## CMS for client editing

Markdown in Git works well when you maintain the site. If a client needs to edit text and images themselves, add a CMS for that project. Astro supports many; see the [CMS guide](https://docs.astro.build/en/guides/cms/).

- **Git-based CMS** (e.g. Decap CMS, Sveltia CMS, Keystatic, TinaCMS, CloudCannon): an editing interface that commits Markdown to the repository. The existing content collections, schemas, and static deployment stay as they are. Usually the best fit for small sites. Map the CMS fields to the schemas in `src/content.config.ts`, and point its media folder at `src/assets/images/` to keep image optimization.
- **Headless CMS** (e.g. Sanity, Storyblok, Contentful, Payload): content lives in the CMS's database. Replace the `glob()` loader for a collection with a loader that fetches from the CMS, keep the schema, and set up a build webhook so publishing triggers a rebuild. Pages keep using `getCollection()`.

Record the choice in `md/DECISIONS.md`: it affects who can edit what, costs, and how content is backed up.

## Analytics

No analytics or cookies are included. To add a service, put its script in `src/layouts/BaseLayout.astro` where the `Analytics` comment is. Keep IDs in a public environment variable so preview builds can omit them:

```astro
---
const analyticsDomain = import.meta.env.PUBLIC_ANALYTICS_DOMAIN;
---

{analyticsDomain && (
  <script
    is:inline
    defer
    data-domain={analyticsDomain}
    src="https://analytics.example.com/script.js"
  ></script>
)}
```

Privacy-friendly, cookieless services usually don't need a consent banner; services that set cookies or track across sites generally do in the EU. Check the requirements for the client's jurisdiction.

## Fonts

The default font stack uses the visitor's system fonts. To use a custom font, use the [Astro Fonts API](https://docs.astro.build/en/guides/fonts/), which downloads, optimizes, and self-hosts it:

```ts
// astro.config.ts
import { defineConfig, fontProviders } from 'astro/config';

export default defineConfig({
  fonts: [
    // A font file in the repository:
    {
      provider: fontProviders.local(),
      name: 'Brand Sans',
      cssVariable: '--font-brand',
      options: {
        variants: [
          { src: ['./src/assets/fonts/BrandSans.woff2'], weight: '400 700', style: 'normal' },
        ],
      },
    },
    // Or from Fontsource / Google Fonts (downloaded at build time, needs network):
    // { provider: fontProviders.fontsource(), name: 'Inter', cssVariable: '--font-brand' },
  ],
});
```

Then add `<Font cssVariable="--font-brand" preload />` (imported from `astro:assets`) inside `<head>` in `src/layouts/BaseLayout.astro`, and point the tokens at it in `src/styles/tokens.css`: `--font-body: var(--font-brand), system-ui, sans-serif;`.

## Multiple languages

Use Astro's [internationalization routing](https://docs.astro.build/en/guides/internationalization/):

1. Add `i18n: { locales: ['en', 'fi'], defaultLocale: 'en', routing: { prefixDefaultLocale: false } }` to `astro.config.ts`.
2. Put translated pages in `src/pages/fi/` (e.g. `src/pages/fi/about.astro` → `/fi/about/`).
3. Move UI strings (navigation labels, button text) from `site.config.ts` into a per-language dictionary, and pass the page's language to `<html lang>` in `BaseLayout`.
4. For translated content, add a language folder or a `lang` field to the collection schema and filter by it.
5. Add `hreflang` alternate links in `src/components/Seo.astro`, and configure the sitemap's `i18n` option.

## React components

Most of the site is plain Astro components, which send no JavaScript to the browser. Use React for parts that need client-side state, such as filters, calculators, or multi-step forms. `src/components/react/ProjectFilter.tsx` is an example.

- Put React components in `src/components/react/` and use them in `.astro` files with a [client directive](https://docs.astro.build/en/reference/directives-reference/#client-directives): `client:visible` (load when scrolled into view, preferred), `client:load` (immediately), or `client:idle`.
- Pass plain, serializable props. Optimize images on the server first (see how `src/pages/projects/index.astro` uses `getImage`).
- Render useful HTML without JavaScript where possible; the server renders the initial state of the component.
- Small interactions (menus, toggles) don't need React; a `<script>` in an Astro component is enough, as in `Header.astro`.
