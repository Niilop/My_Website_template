import { getCollection, type CollectionEntry, type CollectionKey } from 'astro:content';

/** Entries of a collection, without drafts in production builds. */
export async function getPublished<C extends CollectionKey>(
  collection: C,
): Promise<CollectionEntry<C>[]> {
  const entries = await getCollection(collection);
  return entries.filter(
    (entry) => import.meta.env.DEV || !(entry.data as { draft?: boolean }).draft,
  );
}

export async function getProjects() {
  const projects = await getPublished('projects');
  return projects.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getServices() {
  const services = await getPublished('services');
  return services.sort(
    (a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title),
  );
}
