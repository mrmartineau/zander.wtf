const USER = 'mrmartineau';

export type GitHubRepo = {
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
  stars: number;
  date: Date;
};

export type GitHubRelease = {
  repo: string;
  name: string;
  url: string;
  date: Date;
};

export type GitHubNow = {
  active: GitHubRepo[];
  releases: GitHubRelease[];
  starred: GitHubRepo[];
};

type ApiRepo = {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  pushed_at: string;
  fork: boolean;
  archived: boolean;
};

type ApiEvent = {
  type: string;
  repo: { name: string };
  created_at: string;
  payload: {
    action?: string;
    release?: {
      name: string | null;
      tag_name: string;
      html_url: string;
      published_at: string | null;
      draft?: boolean;
      prerelease?: boolean;
    };
  };
};

const fetchGitHub = async <T>(path: string, accept?: string): Promise<T> => {
  const headers: Record<string, string> = {
    Accept: accept ?? 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  // Optional, but unauthenticated calls share 60/hr per IP, which CI runners
  // can blow through. The Actions GITHUB_TOKEN is plenty for public reads.
  const token = import.meta.env.GITHUB_TOKEN;
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  const response = await fetch(`https://api.github.com${path}`, { headers });
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} for ${path}`);
  }
  return (await response.json()) as T;
};

const toRepo = (repo: ApiRepo, date: string): GitHubRepo => ({
  name: repo.name,
  fullName: repo.full_name,
  url: repo.html_url,
  description: repo.description ?? undefined,
  language: repo.language ?? undefined,
  stars: repo.stargazers_count,
  date: new Date(date),
});

const fetchActive = async (limit: number): Promise<GitHubRepo[]> => {
  const repos = await fetchGitHub<ApiRepo[]>(
    `/users/${USER}/repos?type=owner&sort=pushed&per_page=30`,
  );
  return repos
    .filter((repo) => !repo.fork && !repo.archived && repo.name !== USER)
    .slice(0, limit)
    .map((repo) => toRepo(repo, repo.pushed_at));
};

const fetchReleases = async (limit: number): Promise<GitHubRelease[]> => {
  // The events feed only reaches back 90 days, which suits a now page
  const events = await fetchGitHub<ApiEvent[]>(
    `/users/${USER}/events/public?per_page=100`,
  );
  return events
    .filter(
      (event) =>
        event.type === 'ReleaseEvent' &&
        event.payload.action === 'published' &&
        event.payload.release &&
        !event.payload.release.draft &&
        !event.payload.release.prerelease,
    )
    .slice(0, limit)
    .map((event) => {
      // biome-ignore lint/style/noNonNullAssertion: filtered above
      const release = event.payload.release!;
      return {
        repo: event.repo.name,
        name: release.name || release.tag_name,
        url: release.html_url,
        date: new Date(release.published_at ?? event.created_at),
      };
    });
};

const fetchStarred = async (limit: number): Promise<GitHubRepo[]> => {
  // The star+json media type wraps each repo with the date it was starred
  const stars = await fetchGitHub<{ starred_at: string; repo: ApiRepo }[]>(
    `/users/${USER}/starred?per_page=${limit}`,
    'application/vnd.github.star+json',
  );
  return stars.map(({ starred_at, repo }) => toRepo(repo, starred_at));
};

const settle = async <T>(
  label: string,
  promise: Promise<T[]>,
): Promise<T[]> => {
  try {
    return await promise;
  } catch (err) {
    console.warn(
      `[github] Could not fetch ${label}. Returning empty list.`,
      err,
    );
    return [];
  }
};

export const fetchGitHubNow = async (limit = 6): Promise<GitHubNow> => {
  const [active, releases, starred] = await Promise.all([
    settle('active repos', fetchActive(limit)),
    settle('releases', fetchReleases(limit)),
    settle('starred repos', fetchStarred(limit)),
  ]);
  return { active, releases, starred };
};
