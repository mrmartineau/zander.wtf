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

const codenotes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).optional(),
    date: z.date().optional(),
    emoji: z.string().optional(),
    link: z.string().optional(),
  }),
});

export const collections = { blog, worklog, codenotes };
