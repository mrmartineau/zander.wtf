import type { CollectionEntry } from 'astro:content';

type ProjectType = CollectionEntry<'projects'>['data']['type'];

const kinds: Record<ProjectType, string> = {
  'ios-app': 'iPhone app',
  app: 'Web app',
  package: 'Package',
  extension: 'IDE extension',
  'raycast-extension': 'Raycast extension',
  framework: 'Framework',
  experiment: 'Experiment',
};

export const projectKind = (type: ProjectType) => kinds[type];

// Retired projects and apps not yet on the App Store get a label.
export const showProjectStatus = (
  status: CollectionEntry<'projects'>['data']['status'],
) => ['archived', 'inactive', 'unreleased'].includes(status);

// Retired projects are faded in lists.
export const isRetired = (
  status: CollectionEntry<'projects'>['data']['status'],
) => ['archived', 'inactive'].includes(status);

// A project's live site: its `link`, unless that just points at the repo.
export const projectSite = (data: CollectionEntry<'projects'>['data']) =>
  data.link?.startsWith('http') && !data.link.includes('github.com')
    ? data.link
    : undefined;
