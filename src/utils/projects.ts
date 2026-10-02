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
