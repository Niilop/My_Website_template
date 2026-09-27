/**
 * Site-wide settings. Edit this file to rebrand the template.
 *
 * Colors, fonts, spacing, and other visual tokens live in `src/styles/tokens.css`.
 * The logo is `src/assets/brand/logo.svg`; favicon and default social image are in `public/`.
 */

export interface NavLink {
  label: string;
  href: string;
}

export const site = {
  /** Shown in the header, footer, page titles, and social previews. */
  name: 'Example Studio',
  /** Production URL, used for canonical links, the sitemap, and social previews. No trailing slash. */
  url: 'https://example.com',
  /** Default meta description for pages that do not set their own. */
  description:
    'A small, independent studio that plans, designs, and builds useful things for clients and communities.',
  /** Language of the site content, used for `<html lang>`. */
  lang: 'en',
  /** Open Graph locale, e.g. `en_US`, `fi_FI`. */
  ogLocale: 'en_US',
  /** Default social preview image in `public/` (1200×630 recommended). */
  socialImage: '/og-default.png',
  socialImageAlt: 'Example Studio',

  /** Main navigation. Remove an entry here when you delete its page. */
  nav: [
    { label: 'Projects', href: '/projects/' },
    { label: 'Services', href: '/services/' },
    { label: 'Blog', href: '/blog/' },
    { label: 'About', href: '/about/' },
  ] satisfies NavLink[],

  /** Highlighted call-to-action button in the header. Set to `null` to hide it. */
  headerCta: { label: 'Contact', href: '/contact/' } as NavLink | null,

  contact: {
    email: 'hello@example.com',
    /** Display format; the `tel:` link strips spaces. Set to `''` to hide. */
    phone: '+1 555 0100',
    /** Lines of a postal address. Use `[]` to hide. */
    address: ['123 Example Street', 'Example City'] as string[],
  },

  /** Social profiles shown in the footer. Use `[]` to hide. */
  social: [
    { label: 'GitHub', href: 'https://github.com/' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
  ] satisfies NavLink[],

  /**
   * Contact form. Disabled by default: the contact page shows email and phone only.
   * Enabling it requires a server adapter, a delivery service, and spam protection —
   * see docs/integrations.md#contact-form.
   */
  contactForm: {
    enabled: false,
    action: '/api/contact',
  },
};

export type SiteConfig = typeof site;
