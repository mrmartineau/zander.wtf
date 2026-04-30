import urlJoin from 'proper-url-join';

type FetchOtterJsonOptions<T> = {
  endpoint: string;
  query?: Record<string, string | number>;
  fallback: T;
  resourceName: string;
};

const OTTER_API_BASE =
  import.meta.env.OTTER_API_BASE_URL || 'https://otter.zander.wtf/api';

const getOtterHeaders = () => ({
  Authorization: `Bearer ${import.meta.env.SUPABASE_USER_API_KEY || ''}`,
  Accept: 'application/json',
});

const logOtterFailure = ({
  resourceName,
  url,
  status,
  statusText,
  body,
  contentType,
}: {
  resourceName: string;
  url: string;
  status?: number;
  statusText?: string;
  body?: string;
  contentType?: string | null;
}) => {
  const isCloudflareChallenge =
    status === 403 &&
    (body?.includes('Just a moment...') ||
      body?.includes('cf-chl') ||
      body?.includes('challenges.cloudflare.com'));

  const reason = isCloudflareChallenge
    ? 'Cloudflare challenge blocked the request before it reached Otter.'
    : `Request failed${status ? ` with ${status}${statusText ? ` ${statusText}` : ''}` : ''}.`;

  console.warn(
    `[otter] Failed to fetch ${resourceName} from ${url}. ${reason}`,
  );

  if (isCloudflareChallenge) {
    console.warn(
      '[otter] This commonly happens when Cloudflare Bot Fight Mode or similar bot protection is enabled for API traffic.',
    );
    return;
  }

  if (contentType && !contentType.includes('application/json')) {
    console.warn(
      `[otter] Expected JSON but received ${contentType}. Returning fallback data.`,
    );
  }

  if (body) {
    const snippet = body.replace(/\s+/g, ' ').trim().slice(0, 200);
    if (snippet) {
      console.warn(`[otter] Response snippet: ${snippet}`);
    }
  }
};

export const fetchOtterJson = async <T>({
  endpoint,
  query,
  fallback,
  resourceName,
}: FetchOtterJsonOptions<T>): Promise<T> => {
  const url = urlJoin(OTTER_API_BASE, endpoint, query ? { query } : undefined);

  try {
    const response = await fetch(url, {
      headers: getOtterHeaders(),
    });

    if (!response.ok) {
      const body = await response.text();
      logOtterFailure({
        resourceName,
        url,
        status: response.status,
        statusText: response.statusText,
        body,
        contentType: response.headers.get('content-type'),
      });
      return fallback;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const body = await response.text();
      logOtterFailure({
        resourceName,
        url,
        status: response.status,
        statusText: response.statusText,
        body,
        contentType,
      });
      return fallback;
    }

    return (await response.json()) as T;
  } catch (error) {
    console.warn(
      `[otter] Network error while fetching ${resourceName} from ${url}. Returning fallback data.`,
      error,
    );
    return fallback;
  }
};
