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
  name: 'Artist Name',
  /** Production URL, used for canonical links, the sitemap, and social previews. No trailing slash. */
  url: 'https://example.com',
  /** Default meta description for pages that do not set their own. */
  description: 'Paintings and works on paper exploring light, memory, and quiet interior spaces.',
  /** Language of the site content, used for `<html lang>`. */
  lang: 'en',
  /** Open Graph locale, e.g. `en_US`, `fi_FI`. */
  ogLocale: 'en_US',
  /** Default social preview image in `public/` (1200×630 recommended). */
  socialImage: '/og-default.png',
  socialImageAlt: 'Artist Name: paintings and works on paper',

  /** Main navigation. Remove an entry here when you delete its page. */
  nav: [
    { label: 'Works', href: '/works/' },
    { label: 'About', href: '/about/' },
    { label: 'Contact', href: '/contact/' },
  ] satisfies NavLink[],

  /** Highlighted call-to-action button in the header. Set to `null` to hide it. */
  headerCta: null as NavLink | null,

  contact: {
    email: 'studio@example.com',
    /** Display format; the `tel:` link strips spaces. Set to `''` to hide. */
    phone: '',
    /** Lines of a postal address. Use `[]` to hide. */
    address: ['Studio visits by appointment'] as string[],
  },

  /** Social profiles shown in the footer. Use `[]` to hide. */
  social: [{ label: 'Instagram', href: 'https://www.instagram.com/' }] satisfies NavLink[],

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
