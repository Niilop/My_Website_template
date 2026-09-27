import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'works'>;

/** Works without drafts in production, newest first. */
export async function getWorks(): Promise<Work[]> {
  const works = await getCollection('works');
  return works
    .filter((work) => import.meta.env.DEV || !work.data.draft)
    .sort((a, b) => b.data.year - a.data.year || a.data.title.localeCompare(b.data.title));
}

/** Works grouped by series, most recent series first. Works without a series come last. */
export function groupBySeries(works: Work[]): { series: string | null; works: Work[] }[] {
  const groups = new Map<string | null, Work[]>();
  for (const work of works) {
    const key = work.data.series ?? null;
    groups.set(key, [...(groups.get(key) ?? []), work]);
  }
  return [...groups.entries()]
    .map(([series, items]) => ({ series, works: items }))
    .sort((a, b) => {
      if (a.series === null) return 1;
      if (b.series === null) return -1;
      return b.works[0].data.year - a.works[0].data.year;
    });
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const availabilityLabel: Record<NonNullable<Work['data']['availability']>, string> = {
  available: 'Available',
  sold: 'Sold',
  'on-request': 'Price on request',
  'not-for-sale': 'Not for sale',
};

/** Caption used under thumbnails: "Title, 2024". */
export function workCaption(work: Work): string {
  return `${work.data.title}, ${work.data.year}`;
}
