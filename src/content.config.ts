/**
 * Content collections: typed, repeatable content stored as Markdown in src/content/.
 * Each schema validates front matter at build time, so mistakes fail the build with a clear message.
 * https://docs.astro.build/en/guides/content-collections/
 */
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const projects = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/projects' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      summary: z.string(),
      date: z.coerce.date(),
      cover: z.object({ src: image(), alt: z.string() }).optional(),
      tags: z.array(z.string()).default([]),
      /** Shown on the home page. */
      featured: z.boolean().default(false),
      /** Drafts appear in development but not in production builds. */
      draft: z.boolean().default(false),
      links: z.array(z.object({ label: z.string(), href: z.url() })).default([]),
      gallery: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),
    }),
});

const services = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/services' }),
  schema: z.object({
    title: z.string(),
    summary: z.string(),
    /** Lower numbers appear first. */
    order: z.number().default(0),
    draft: z.boolean().default(false),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      cover: z.object({ src: image(), alt: z.string() }).optional(),
      draft: z.boolean().default(false),
    }),
});

export const collections = { projects, services, blog };
