export const SITE_TITLE = `Hi! I'm Zander, I make web things`;

// shows the available for work banner at the bottom of the site
export const SHOW_STATUS = false;

export const SITE_METADATA: Record<
  string,
  { title: string; subtitle?: string; ogTitle?: string }
> = {
  home: {
    title: `Zander Martineau | Front-end, design systems, SEO and AEO`,
    subtitle: `Zander Martineau is a product engineer in London. Front-end, design systems, SEO, AEO, GEO and iOS apps. 18 years of experience.`,
  },
  blog: {
    title: 'Blog',
    ogTitle: 'My blog',
    subtitle:
      'Writing about web development, AI tools, self-hosting and side projects, with a worklog of what I have shipped in between',
  },
  about: {
    title: 'About',
    subtitle: 'My name is Zander, I live in London, UK',
  },
  'work-with-me': {
    title: 'Work with me',
    subtitle:
      'Websites and web apps, design systems, SEO, AEO, GEO and iPhone apps from a London product engineer',
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
  now: {
    title: 'Now',
    subtitle: `Films, TV, books, podcasts…and other things I'm currently enjoying`,
  },
  notes: {
    title: 'Code Notes',
    ogTitle: 'Code Notes',
    subtitle: 'TILs, snippets—my digital code garden',
  },
  stats: {
    title: 'Stats',
    subtitle: 'Views, hearts and highlights for every page, live',
  },
  search: {
    title: 'Search',
    subtitle: 'Search blog posts, code notes, projects and more',
  },
  projects: {
    title: 'Projects',
    subtitle:
      'Side-projects, packages and other things I have made or am making',
  },
  privacy: {
    title: 'Privacy policy',
    subtitle: 'How my iOS apps handle your data',
  },
  terms: {
    title: 'Terms & conditions',
    subtitle: 'The terms for using my iOS apps',
  },
  support: {
    title: 'Support',
    subtitle: 'Help with my iOS apps',
  },
  'zed-stack': {
    title: 'The Zed Stack',
    ogTitle: 'The Zed Stack',
    subtitle:
      'The starters, tools and automation I use to get from an idea to a deployed project in an afternoon',
  },
};

// `key` is the single-letter keyboard shortcut for the page. See Shortcuts.astro.
export const SITE_NAV_ITEMS = [
  {
    text: 'Blog',
    key: 'b',
    url: '/blog',
  },
  {
    text: 'Projects',
    key: 'p',
    url: '/projects',
  },
  {
    text: 'Links',
    key: 'l',
    url: '/links',
  },
];

export const SITE_FOOTER_ITEMS = [
  {
    text: 'Work with me',
    key: 'w',
    url: '/work-with-me',
  },
  {
    text: 'CV/Resume',
    key: 'r',
    url: '/cv',
  },
  {
    text: 'Code Notes',
    key: 'c',
    url: '/notes',
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
    text: 'Now',
    key: 'n',
    url: '/now',
  },
  {
    text: 'Uses',
    key: 'u',
    url: '/uses',
  },
  {
    text: 'Stats',
    key: 's',
    url: '/stats',
  },
  {
    text: 'Zed Stack',
    url: '/zed-stack',
  },
  {
    text: 'Lab',
    url: 'https://lab.zander.wtf',
    external: true,
    key: 'a',
  },
  {
    text: 'GitHub',
    url: 'https://github.com/mrmartineau',
    external: true,
    key: 'g',
  },
  {
    text: 'Bluesky',
    url: 'https://bsky.app/profile/zander.wtf',
    rel: 'me',
    external: true,
  },
];

export const ABOUT_ME = {
  bio: `Product engineer specialising in front-end web development, with 18 years of experience. I also work on design systems, SEO, AEO, GEO and iOS apps - building products that work well for the people who use them.`,
  email: 'mailto:hi+enquiry@zander.wtf',
};

type Job = {
  url: string;
  name: string;
  description?: string;
  type?: 'contract' | 'employed';
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
    name: 'Working on various projects',
    url: '/work-with-me',
    description:
      "I'm working on various projects now, and I'm looking for my next role. Please take a look around and get in touch.",
  },
  previous: [
    {
      name: 'Dare',
      url: 'https://dare.global',
      description: `Staff Software Engineer and web team lead. I maintained and evolved Dare's core ETRM (Energy Trading and Risk Management) platform — a complex, data-intensive system — and built a new component library from the ground up, bringing visual and functional consistency across the product suite.`,
      type: 'employed',
    },
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
