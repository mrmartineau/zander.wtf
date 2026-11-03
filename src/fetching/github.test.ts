import { afterEach, describe, expect, it, vi } from 'vitest';
import { fetchGitHubNow } from './github';

const repo = (name: string, extra = {}) => ({
  name,
  full_name: `mrmartineau/${name}`,
  html_url: `https://github.com/mrmartineau/${name}`,
  description: null,
  language: 'TypeScript',
  stargazers_count: 3,
  pushed_at: '2026-10-01T00:00:00Z',
  fork: false,
  archived: false,
  ...extra,
});

const release = (tag: string, extra = {}) => ({
  type: 'ReleaseEvent',
  repo: { name: 'mrmartineau/zui' },
  created_at: '2026-10-02T00:00:00Z',
  payload: {
    action: 'published',
    release: {
      name: '',
      tag_name: tag,
      html_url: `https://github.com/mrmartineau/zui/releases/${tag}`,
      published_at: '2026-10-02T00:00:00Z',
      ...extra,
    },
  },
});

const respond = (routes: Record<string, unknown>) =>
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      const match = Object.keys(routes).find((path) => url.includes(path));
      return match
        ? new Response(JSON.stringify(routes[match]))
        : new Response('nope', { status: 500 });
    }),
  );

afterEach(() => vi.unstubAllGlobals());

describe('fetchGitHubNow', () => {
  it('drops forks, archived repos and the profile repo', async () => {
    respond({
      '/repos?': [
        repo('fork', { fork: true }),
        repo('old', { archived: true }),
        repo('mrmartineau'),
        repo('zui'),
      ],
    });
    const { active } = await fetchGitHubNow();
    expect(active.map((r) => r.name)).toEqual(['zui']);
  });

  it('keeps published, non-draft, non-prerelease releases', async () => {
    respond({
      '/events/public': [
        release('v1.0.0'),
        release('v1.1.0-beta', { prerelease: true }),
        { ...release('v0.9.0'), payload: { action: 'created' } },
        { type: 'PushEvent', repo: { name: 'x' }, created_at: '', payload: {} },
      ],
    });
    const { releases } = await fetchGitHubNow();
    expect(releases).toHaveLength(1);
    expect(releases[0].name).toBe('v1.0.0');
  });

  it('dates starred repos by when they were starred', async () => {
    respond({
      '/starred': [{ starred_at: '2026-09-09T00:00:00Z', repo: repo('a') }],
    });
    const { starred } = await fetchGitHubNow();
    expect(starred[0].date.toISOString()).toBe('2026-09-09T00:00:00.000Z');
  });

  it('falls back to empty lists when the API fails', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    respond({});
    expect(await fetchGitHubNow()).toEqual({
      active: [],
      releases: [],
      starred: [],
    });
  });
});
