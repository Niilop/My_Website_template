import type { APIRoute } from 'astro';

/** robots.txt pointing crawlers to the sitemap. Change `Allow` to `Disallow` to block indexing (e.g. on a staging site). */
export const GET: APIRoute = ({ site }) => {
  const sitemap = new URL('sitemap-index.xml', site).href;
  return new Response(`User-agent: *\nAllow: /\n\nSitemap: ${sitemap}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
};
