import { existsSync } from 'node:fs';
import { defineConfig, envField } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { site } from './src/site.config';

// Fail fast if the contact form is switched on without its server route.
if (
  site.contactForm.enabled &&
  !existsSync(new URL('./src/pages/api/contact.ts', import.meta.url))
) {
  throw new Error(
    'site.contactForm.enabled is true, but src/pages/api/contact.ts does not exist. ' +
      'See docs/integrations.md#contact-form.',
  );
}

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: site.url,
  // Static HTML by default. Add an adapter only for on-demand routes such as the contact form.
  output: 'static',
  integrations: [
    react(),
    sitemap({
      filter: (page) => !page.includes('/contact/sent/'),
    }),
  ],
  // Custom fonts: see docs/integrations.md#fonts. The default is a system font stack.
  env: {
    // Only used when the contact form is enabled. Secrets are read at runtime, never bundled.
    schema: {
      CONTACT_DELIVERY: envField.enum({
        context: 'server',
        access: 'secret',
        values: ['resend', 'webhook'],
        optional: true,
      }),
      CONTACT_TO_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_FROM_EMAIL: envField.string({ context: 'server', access: 'secret', optional: true }),
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_WEBHOOK_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({
        context: 'server',
        access: 'secret',
        optional: true,
      }),
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({
        context: 'client',
        access: 'public',
        optional: true,
      }),
    },
  },
});
