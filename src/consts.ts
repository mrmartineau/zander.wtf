export const SITE_TITLE = `Hi! I'm Zander, I make web things`;
export const SHOW_STATUS = false;

export const SITE_METADATA: Record<
  string,
  { title: string; subtitle?: string; ogTitle?: string }
> = {
  home: {
    title: `Hi! I'm Zander, I make web things`,
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
  projects: {
    title: 'Projects',
    subtitle: 'Side-projects, packages and other things I have made or am making',
  },
};

export const SITE_NAV_ITEMS = [
  {
    text: 'Blog',
    url: '/blog',
  },
  {
    text: 'Projects',
    url: '/projects',
  },
  {
    text: 'Links',
    url: '/links',
  },
];

export const SITE_FOOTER_ITEMS = [
  {
    text: 'CV/Resume',
    url: '/cv',
  },
  {
    text: 'Code Notes',
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
    text: 'Lab',
    url: 'https://lab.zander.wtf',
    external: true,
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
];

export const ABOUT_ME = {
  bio: `Product engineer with 18 years of experience, specialising in front-end and design systems - building products that work well for the people who use them.`,
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
    description: `Staff Software Engineer and web team lead. I maintained and evolved Dare's core ETRM (Energy Trading and Risk Management) platform — a complex, data-intensive system — and built a new component library from the ground up, bringing visual and functional consistency across the product suite.`,
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

