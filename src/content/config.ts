import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    modified: z.date().optional(),
    opengraphImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

const worklog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.date(),
  }),
});

export const collections = { blog, worklog };
