import type { APIRequestContext } from '@playwright/test';

/**
 * Every page listed in the sitemap, as local paths. Tests use this so that adding or
 * removing pages does not require editing the tests.
 */
export async function sitemapPaths(request: APIRequestContext): Promise<string[]> {
  const index = await (await request.get('/sitemap-index.xml')).text();
  const sitemaps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
  const paths: string[] = [];
  for (const sitemap of sitemaps) {
    const xml = await (await request.get(sitemap)).text();
    paths.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname));
  }
  return paths;
}
