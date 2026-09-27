/**
 * Content collections: typed, repeatable content stored in src/content/.
 * Each schema validates front matter at build time, so mistakes fail the build with a clear message.
 * https://docs.astro.build/en/guides/content-collections/
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** One Markdown file per artwork. The file name becomes the URL: /works/<file-name>/ */
const works = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/works' }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      year: z.number().int(),
      /** e.g. "Oil on linen" */
      medium: z.string(),
      /** e.g. "120 × 90 cm" */
      dimensions: z.string().optional(),
      image: z.object({ src: image(), alt: z.string() }),
      /** Close-ups or installation views, shown in a gallery on the work's page. */
      details: z
        .array(z.object({ src: image(), alt: z.string(), caption: z.string().optional() }))
        .default([]),
      /** Works with the same series name are grouped together. */
      series: z.string().optional(),
      availability: z.enum(['available', 'sold', 'on-request', 'not-for-sale']).optional(),
      /** Shown only when availability is "available", e.g. "€ 2 400". */
      price: z.string().optional(),
      /** Shown on the home page. */
      featured: z.boolean().default(false),
      /** Drafts appear in development but not in production builds. */
      draft: z.boolean().default(false),
    }),
});

/** Structured data example: exhibitions listed on the about page. */
const exhibitions = defineCollection({
  loader: file('src/content/exhibitions.yaml'),
  schema: z.object({
    year: z.number().int(),
    title: z.string(),
    venue: z.string(),
    city: z.string(),
    kind: z.enum(['solo', 'group']),
  }),
});

export const collections = { works, exhibitions };
