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

const tools = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    repo: z.string().optional(),
    link: z.string().optional(),
    status: z.enum(['active', 'archived', 'inactive', 'ongoing']).default('active'),
    tech: z.string().optional(),
    showReadme: z.boolean().optional().default(false),
  }),
});

export const collections = { blog, worklog, codenotes, tools };
