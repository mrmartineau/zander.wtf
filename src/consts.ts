export const SITE_TITLE = `Hi! I'm Zander, I make websites`
export const SITE_DESCRIPTION = `Zander Martineau's personal site`

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
]

export const SITE_FOOTER_ITEMS = [
  {
    text: 'Colophon',
    url: '/colophon',
  },
  {
    text: 'Uses',
    url: '/uses',
  },
  {
    text: 'Code Notes',
    url: 'https://notes.zander.wtf',
    external: true,
  },
  {
    text: 'GitHub',
    url: 'https://github.com/mrmartineau',
    external: true,
  },
  {
    text: 'Mastodon',
    url: 'https://toot.cafe/@zander',
    rel: 'me',
    external: true,
  },
  {
    text: 'CV',
    url: 'https://read.cv/mrmartineau',
    external: true,
  },
  {
    text: 'RSS',
    url: '/atom.xml',
    icon: 'ph-rss-simple',
  },
]

export const ABOUT_ME = {
  bio: 'I am a contract front-end specialist / product engineer with over 15 years of experience across a range of business sectors.',
  cv: 'https://read.cv/mrmartineau',
}

export const JOBS = {
  current: {
    name: 'Fathom',
    description:
      'Multiple projects: Cryptocurrency exchange (Tradeblock), Investment banking app (Commerzbank), Legacy React app rebrand (Cappitech), Clearwater Analytics',
    type: 'contract',
    url: 'https://www.fathomlondon.com',
  },
  previous: [
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
      url: 'https://www.yourheights.com',
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
  ],
}

export type Project = {
  name: string
  description: string
  link?: string
  status: 'active' | 'archived' | 'inactive' | 'ongoing'
  tech?: string
  published?: 'private' | 'public'
  subitems?: { name: string; description?: string; link?: string }[]
}

export const SIDE_PROJECTS: Project[] = [
  {
    name: 'Journal',
    description:
      'Personal journalling app built to help me start writing more. Open source.',
    link: 'https://github.com/mrmartineau/journal',
    status: 'active',
    tech: 'SvelteKit, TypeScript, A.I. powered text improvements, Postgres and authentication (powered by Supabase)',
  },
  {
    name: 'Otter',
    description: 'Personal bookmarking app. Not open source yet.',
    link: 'https://github.com/mrmartineau/Otter',
    status: 'active',
    published: 'private',
    tech: 'React, Next.js, TypeScript, Postgres and authentication (powered by Supabase), Tailwind',
  },
  {
    name: 'Raycast extensions',
    description:
      'A collection of Raycast extensions for personal and public use. Some are published to the Raycast store.',
    link: 'https://github.com/mrmartineau/raycast-extensions',
    status: 'ongoing',
    subitems: [
      {
        name: 'Search npm Packages',
        description: 'Search and favouriting for npm packages',
        link: 'https://www.raycast.com/mrmartineau/search-npm',
      },
      {
        name: 'GitHub Stars',
        description: 'Display and filter your recent GitHub stars',
        link: 'https://www.raycast.com/mrmartineau/search-github-stars',
      },
      {
        name: 'Otter',
        description:
          'View, search and add for my Otter bookmarking project. Not published to the store yet.',
        link: 'https://github.com/mrmartineau/raycast-extensions/tree/main/otter',
      },
      {
        name: 'Code Notes Search',
        description:
          'Search my code notes with Algolia Not published to the store yet.',
        link: 'https://github.com/mrmartineau/raycast-extensions/tree/main/code-notes-search',
      },
    ],
  },
  {
    name: 'Code Notes v2',
    description: 'TILs, snippets—my digital code garden 🌱',
    link: 'https://github.com/mrmartineau/notes.zander.wtf',
    status: 'active',
    tech: 'Eleventy, Nunjucks, TypeScript, PostCSS, Algolia search',
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
]
