import kit from '@mrmartineau/kit/oxfmt' with { type: 'json' }

export default {
  ...kit,
  ignorePatterns: [
    '**/dist',
    'raycast-extension/**',
    'worker-configuration.d.ts',
    '**/*.md',
    '**/*.mdx',
    '**/*.yml',
    '**/*.yaml',
    '**/*.html',
  ],
}
