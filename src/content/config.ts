import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import {
  type EntryMetaOptions,
  entryMeta,
  type GitInfo,
  gitInfo,
  readingTime,
  wordCount,
} from 'astro-entry-meta';

// Computed for the blog and the code notes. They are in the schemas below too,
// or the schema would remove them.
const computed: EntryMetaOptions['computed'] = {
  readingTime: ({ body }) => readingTime(body ?? ''),
  wordCount: ({ body }) => wordCount(body ?? ''),
  // One commit is enough: only `editUrl` is shown
  git: ({ filePath }) =>
    filePath &&
    gitInfo(filePath, {
      editUrl: 'https://github.com/mrmartineau/zander.wtf/edit/main/',
      historyLimit: 1,
    }),
};
const computedSchema = {
  readingTime: z.number(),
  wordCount: z.number(),
  git: z.custom<GitInfo>().optional(),
};

const blog = defineCollection({
  // `_` folders and files (drafts, templates) stay out, as with the old
  // `type: 'content'` collections
  loader: entryMeta(
    glob({
      pattern: ['**/*.{md,mdx}', '!**/_*', '!**/_*/**'],
      base: './src/content/blog',
    }),
    // `draft: true` entries are left out of the build; dev still shows them
    { preview: import.meta.env.DEV, computed },
  ),
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    modified: z.date().optional(),
    opengraphImage: z.string().optional(),
    tags: z.array(z.string()).optional(),
    // Worklog entries live in blog/worklog/ and render in full on the /blog
    // listing rather than as a title-only row.
    worklog: z.boolean().optional().default(false),
    // Hidden from production builds, the feeds and the OG images; still
    // renders in dev so it can be previewed. Keep drafts in blog/_drafts/
    // too: the search indexer skips by directory, not frontmatter.
    draft: z.boolean().optional().default(false),
    ...computedSchema,
  }),
});

const codenotes = defineCollection({
  loader: entryMeta(
    glob({ pattern: '**/*.md', base: './src/content/codenotes' }),
    // `draft: true` notes are left out of the build; dev still shows them.
    // Keep drafts in codenotes/_drafts/ too: the search indexer skips by
    // directory, not frontmatter.
    { preview: import.meta.env.DEV, computed },
  ),
  schema: z.object({
    title: z.string(),
    tags: z.array(z.string()).optional(),
    date: z.date().optional(),
    emoji: z.string().optional(),
    link: z.string().optional(),
    ...computedSchema,
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    repo: z.string().optional(),
    link: z.string().optional(),
    // iOS apps only, and only once each exists — an app can be on
    // TestFlight long before it has an App Store page, or vice versa.
    appStore: z.string().optional(),
    testFlight: z.string().optional(),
    // One line, shown above the screenshots. Omit for free things.
    pricing: z.string().optional(),
    status: z
      .enum(['active', 'archived', 'inactive', 'ongoing', 'unreleased'])
      .default('active'),
    type: z.enum([
      'ios-app',
      'app',
      'package',
      'astro-package',
      'extension',
      'chrome-extension',
      'raycast-extension',
      'framework',
      'experiment',
    ]),
    tech: z.string().optional(),
    showReadme: z.boolean().optional().default(false),
    promote: z.boolean().optional().default(false),
    bgColour: z.string().optional(),
    fgColour: z.string().optional(),
    image: z.string().optional(),
    // Public-root absolute paths, same convention as `image`. Rendered as a
    // horizontally scrolling, snapping strip on the project detail page.
    screenshots: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string().optional(),
        }),
      )
      .optional(),
  }),
});

const cv = defineCollection({
  type: 'content',
  schema: z.object({
    company: z.string(),
    url: z.string().optional(),
    industry: z.string(),
    title: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    type: z.enum(['employed', 'contract', 'freelance']),
    tech: z.array(z.string()).optional(),
  }),
});

export const collections = { blog, codenotes, projects, cv };
