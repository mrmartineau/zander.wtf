export const SITE_TITLE = `Hi! I'm Zander, I make websites`;
export const SHOW_STATUS = false;

export const SITE_METADATA: Record<
  string,
  { title: string; subtitle?: string; ogTitle?: string }
> = {
  home: {
    title: `Hi! I'm Zander, I make websites`,
    subtitle: `Zander Martineau's personal site. I'm a Staff Software Engineer at Dare Global with 15+ years shipping products, rewriting apps, and building POCs across front-end and full-stack.`,
  },
  blog: {
    title: 'Blog',
    ogTitle: 'My blog',
    subtitle:
      'Thoughts, ramblings and ideas. Mostly related to web development',
  },
  about: {
    title: 'About',
    subtitle: 'My name is Zander, I live in London, UK',
  },
  colophon: {
    title: 'Colophon',
    subtitle: `What's up with this site?`,
  },
  feeds: {
    title: 'Feeds',
    subtitle: 'RSS',
  },
  links: {
    title: 'Links',
    subtitle: `Hand-picked hyperlinks, all saved in my Otter bookmarking app`,
  },
  uses: {
    title: 'My setup',
    subtitle: `An overview of my hardware and software setup`,
  },
  worklog: {
    title: 'Worklog',
    subtitle: `The changelog.md of my work life.`,
  },
  now: {
    title: 'Now',
    subtitle: `What I'm up to now`,
  },
  notes: {
    title: 'Code Notes',
    ogTitle: 'Code Notes',
    subtitle: 'TILs, snippets—my digital code garden',
  },
  search: {
    title: 'Search Notes',
    subtitle: 'Search through all code notes',
  },
};

export const SITE_NAV_ITEMS = [
  {
    text: 'Blog',
    url: '/blog',
  },
  {
    text: 'Links',
    url: '/links',
  },
  {
    text: 'About',
    url: '/about',
  },
  {
    text: 'Notes',
    url: '/notes',
  },
];

export const SITE_FOOTER_ITEMS = [
  {
    text: 'CV/Resume',
    url: '/cv',
  },
  {
    text: 'Feeds',
    url: '/feeds',
  },
  {
    text: 'Colophon',
    url: '/colophon',
  },
  {
    text: 'Worklog',
    url: '/worklog',
  },
  {
    text: 'Now',
    url: '/now',
  },
  {
    text: 'Uses',
    url: '/uses',
  },
  {
    text: 'Notes',
    url: '/notes',
  },
  {
    text: 'GitHub',
    url: 'https://github.com/mrmartineau',
    external: true,
  },
  {
    text: 'Bluesky',
    url: 'https://bsky.app/profile/zander.wtf',
    rel: 'me',
    external: true,
  },
  {
    text: 'Mastodon',
    url: 'https://toot.cafe/@zander',
    rel: 'me',
    external: true,
  },
];

export const ABOUT_ME = {
  bio: `I am a front-end web developer with over 15 years experience helping companies bring products to market, rewriting apps, creating POCs and more.`,
  // cv: 'https://read.cv/mrmartineau',
  email: 'mailto:hi+enquiry@zander.wtf',
};

type Job = {
  url: string;
  name: string;
  description?: string;
  type: 'contract' | 'employed';
  projects?: {
    name: string;
    description: string;
    link?: string;
  }[];
};

interface Jobs {
  current?: Job;
  previous: Job[];
}
export const JOBS: Jobs = {
  current: {
    name: 'Dare',
    url: 'https://dare.global',
    description: `Staff Software Engineer`,
    type: 'employed',
  },
  previous: [
    {
      name: 'Fathom',
      description:
        'Multiple projects: Cryptocurrency exchange (Tradeblock), Investment banking app (Commerzbank), Legacy React app rebrand (Cappitech), Financial insights app (Clearwater Analytics)',
      type: 'contract',
      url: 'https://www.fathomlondon.com',
    },
    {
      name: 'Utopia Music',
      description: 'Rostr 2.0',
      type: 'contract',
      url: 'https://utopiamusic.com',
    },
    {
      name: 'Babylon Health',
      description: '',
      type: 'contract',
      url: 'https://babylonhealth.com',
    },
    {
      name: 'Digital Futures',
      description: '',
      type: 'contract',
      url: 'https://digitalfutures.com',
      projects: [
        {
          name: '',
          description: '',
        },
      ],
    },
    {
      name: 'Heights',
      description: '',
      type: 'contract',
      url: 'https://www.heights.com',
      projects: [
        {
          name: '',
          description: '',
        },
      ],
    },
    {
      name: 'Curve',
      description: '',
      type: 'contract',
      url: 'https://curve.com',
      projects: [
        {
          name: 'Samsung Pay Card integration',
          description:
            'The web-based onboarding flow for Samsung Pay Card and the Curve app',
        },
        {
          name: `Curve's design-system (private)`,
          description: 'A React component library',
        },
        {
          name: 'New version of curve.com',
          description: 'Built with Gatsby',
        },
      ],
    },
    {
      name: 'FairFX',
      description: '',
      type: 'contract',
      url: 'https://fairfx.com',
    },
    {
      name: 'Nimbletank',
      description: '',
      type: 'employed',
      url: 'https://nimbletank.com',
      projects: [
        {
          name: 'The Royal Mint',
          description: 'Digital wallet app for The Royal Mint',
        },
      ],
    },
    {
      name: 'TMW Unlimited',
      description: '',
      type: 'employed',
      url: 'https://tmwunlimited.com',
      projects: [
        {
          name: 'Barilla.com',
          description: 'Barilla.com website redevelopment',
          link: 'https://www.barilla.com',
        },
      ],
    },
    {
      name: 'Neverbland',
      description: '',
      type: 'employed',
      url: 'https://neverbland.com',
    },
  ],
};

export type Project = {
  name: string;
  description: string;
  link?: string;
  repo?: string;
  status: 'active' | 'archived' | 'inactive' | 'ongoing';
  tech?: string;
  published?: 'private' | 'public';
  subitems?: Project[];
};

export const SIDE_PROJECTS: Project[] = [
  {
    name: '@mrmartineau/zui',
    description: `A CSS-first UI library with optional React and Astro components.`,
    repo: 'https://github.com/mrmartineau/zui',
    status: 'active',
    tech: 'CSS, React, Astro',
  },
  {
    name: '@mrmartineau/xtractr',
    description: `Reusable page content (as markdown) and metadata extractor, based on Obsidian's Defuddle extractor.`,
    repo: 'https://github.com/mrmartineau/xtractr',
    status: 'active',
    tech: 'TypeScript',
  },
  {
    name: 'npm package template',
    description: `A small, reusable starter repo for building TypeScript npm packages with its own SKILL.md for AI-powered skill development.`,
    repo: 'https://github.com/mrmartineau/npm-package',
    status: 'active',
    tech: 'TypeScript',
  },
  {
    name: '@mrmartineau/kit',
    description: 'A personal collection of sounds, utilities, components, and hooks for use across projects',
    repo: 'https://github.com/mrmartineau/kit',
    status: 'active',
    tech: 'TypeScript, Biome, OxLint, OxFmt, ESLint, Prettier',
  },
  {
    name: '@mrmartineau/strifx',
    description: 'Like clsx for strings — conditionally compose any string, not just classNames.',
    repo: 'https://github.com/mrmartineau/strifx',
    status: 'active',
    tech: 'TypeScript',
  },
  {
    name: 'Surround for Zed',
    description: 'A Zed extension that lets you surround selected text with code snippets — inspired by vscode-surround.',
    repo: 'https://github.com/mrmartineau/zed-surround',
    status: 'active',
    tech: 'Rust, TypeScript, LSP server',
  },
  {
    name: 'Lang Compare',
    description: 'Compare language features across a range of topics in a structured, comparable format.',
    repo: 'https://github.com/mrmartineau/lang-compare',
    link: 'https://lang-compare.zander.wtf',
    status: 'active',
    tech: 'Astro, TypeScript',
  },
  {
    name: 'url-merge',
    description: 'A zero-dependency URL path joiner. Like path.join() but for URLs.',
    repo: 'https://github.com/mrmartineau/url-merge',
    status: 'active',
    tech: 'TypeScript',
  },
  {
    name: 'Otter',
    description: 'Self-hosted personal bookmarking app. Open source.',
    repo: 'https://github.com/mrmartineau/Otter',
    link: '/blog/otter-v2',
    status: 'active',
    tech: 'React, Next.js, TypeScript, PostgreSQL and authentication (powered by Supabase), Tailwind',
  },
  {
    name: 'zander.wtf',
    description: 'This very website. Open source.',
    link: 'https://github.com/mrmartineau/zander.wtf',
    status: 'active',
    tech: 'Astro, TypeScript, PostCSS, Tailwind',
  },
  {
    name: 'Raycast extensions',
    description:
      'A collection of Raycast extensions for personal and public use. Some are published to the Raycast store.',
    link: 'https://github.com/mrmartineau/raycast-extensions',
    status: 'ongoing',
    subitems: [
      {
        name: 'Bird',
        description: 'View your X/Twitter bookmarks and likes in Raycast using the bird CLI',
        link: 'https://github.com/mrmartineau/raycast-extensions/tree/main/bird',
        status: 'active',
      },
      {
        name: 'Search npm Packages',
        description: 'Search and favouriting for npm packages. 18k+ users',
        link: 'https://www.raycast.com/mrmartineau/search-npm',
        status: 'active',
      },
      {
        name: 'GitHub Stars',
        description: 'Display and filter your recent GitHub stars. 3.3k+ users',
        link: 'https://www.raycast.com/mrmartineau/search-github-stars',
        status: 'active',
      },
      {
        name: 'Otter',
        description:
          'View, search and add for my Otter bookmarking project. Not published to the store yet.',
        link: 'https://github.com/mrmartineau/raycast-extensions/tree/main/otter',
        status: 'active',
      },
      {
        name: 'Code Notes Search',
        description:
          'Search my code notes with Algolia Not published to the store yet.',
        link: 'https://github.com/mrmartineau/raycast-extensions/tree/main/code-notes-search',
        status: 'active',
      },
    ],
  },
  {
    name: 'Journal',
    description: 'Personal journalling app. Open source.',
    link: 'https://github.com/mrmartineau/journal',
    status: 'inactive',
    tech: 'SvelteKit, TypeScript, A.I. powered text improvements, PostgreSQL and authentication (powered by Supabase)',
  },
  {
    name: 'cloudflare-worker-scraper',
    description: `Page Metadata Scraper with Cloudflare workers. It uses a Cloudflare's HTMLRewriter to scrape the page for metadata and returns it as JSON.`,
    link: 'https://github.com/mrmartineau/cloudflare-worker-scraper',
    status: 'inactive',
    tech: 'TypeScript, Cloudflare workers',
  },
  {
    name: 'Code Notes',
    description: 'TILs, snippets—my digital code garden. This site has been archived and has been incorporated into the "notes" section of this site.',
    link: '/notes',
    repo: 'https://github.com/mrmartineau/zander.wtf',
    status: 'inactive',
    tech: 'Astro, TypeScript, PostCSS, Algolia search',
  },
  {
    name: 'Rigel VS Code theme',
    description: 'Port of Rigel theme for VS Code',
    link: 'https://github.com/mrmartineau/rigel-vscode',
    status: 'active',
  },
  {
    name: 'Code Notes (Gatsby Theme)',
    description: 'Gatsby theme for your digital garden (archived)',
    link: 'https://github.com/mrmartineau/gatsby-theme-code-notes',
    status: 'archived',
    tech: 'Gatsby, MDX, TypeScript, Theme UI',
  },
  {
    name: 'Design System Utils',
    description:
      'Design System Utils is a micro framework that standardises your design-system and provide helpful utilities to access its information. It can be used with styled-components, emotion, glamorous or any other CSS-in-JS framework.',
    link: 'https://github.com/mrmartineau/design-system-utils',
    status: 'inactive',
  },
  {
    name: 'prismic-reactjs-custom',
    description:
      'This is an opinionated fork of prismic-reactjs that allows you to use custom React components instead of standard HTML tags.',
    link: 'https://github.com/mrmartineau/prismic-reactjs-custom',
    status: 'inactive',
  },
  {
    name: 'Kickoff',
    description:
      'Kickoff is a lightweight, flexible and robust Sass-based front-end framework that is a great starting point for any web site. Developed for projects at TMW, but it grew way beyond internal projects into something that many other companies and developers use on projects of all sizes.',
    link: 'https://github.com/TryKickoff/kickoff',
    status: 'inactive',
  },
  {
    name: 'trak.js',
    description: 'Universal analytics event tracking API wrapper',
    link: 'https://github.com/mrmartineau/trak.js',
    status: 'inactive',
  },
];
