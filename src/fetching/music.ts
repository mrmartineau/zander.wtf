import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import type { NowMediaItem } from 'src/types';
import urlMerge from 'url-merge';

export interface Env {
  LASTFM_API_KEY: string;
}

type LastFmArtist = {
  name?: string;
  url?: string;
  artist?: {
    name?: string;
  };
  image?: Array<{
    '#text'?: string;
  }>;
};

type LastFmResponse = {
  topartists?: {
    artist?: LastFmArtist[];
  };
  topalbums?: {
    album?: LastFmArtist[];
  };
};

const sdk = SpotifyApi.withClientCredentials(
  import.meta.env.SPOTIFY_CLIENT_ID,
  import.meta.env.SPOTIFY_CLIENT_SECRET,
  ['user-top-read'],
);

export const fetchMusic = async (
  limit = 5,
): Promise<{ topArtists: LastFmArtist[]; topAlbums: LastFmArtist[] }> => {
  const topArtistsPath = urlMerge('https://ws.audioscrobbler.com/2.0/', {
    query: {
      method: 'user.gettopartists',
      user: 'martineau',
      api_key: import.meta.env.LASTFM_API_KEY as string,
      format: 'json',
      limit,
      period: '1month',
    },
  });

  const topAlbumsPath = urlMerge('https://ws.audioscrobbler.com/2.0/', {
    query: {
      method: 'user.gettopalbums',
      user: 'martineau',
      api_key: import.meta.env.LASTFM_API_KEY as string,
      format: 'json',
      limit,
      period: '1month',
    },
  });

  try {
    const [topArtistsResponse, topAlbumsResponse] = await Promise.all([
      fetch(topArtistsPath, {
        headers: {
          Accept: 'application/json',
        },
      }),
      fetch(topAlbumsPath, {
        headers: {
          Accept: 'application/json',
        },
      }),
    ]);

    if (!topArtistsResponse.ok || !topAlbumsResponse.ok) {
      console.warn(
        `[music] Failed to fetch Last.fm data. artists=${topArtistsResponse.status} ${topArtistsResponse.statusText}, albums=${topAlbumsResponse.status} ${topAlbumsResponse.statusText}`,
      );
      return {
        topArtists: [],
        topAlbums: [],
      };
    }

    const topArtists = (await topArtistsResponse.json()) as LastFmResponse;
    const topAlbums = (await topAlbumsResponse.json()) as LastFmResponse;

    return {
      topArtists: topArtists?.topartists?.artist ?? [],
      topAlbums: topAlbums?.topalbums?.album ?? [],
    };
  } catch (err) {
    console.warn('[music] Network error while fetching Last.fm data. Returning empty lists.', err);
    return {
      topArtists: [],
      topAlbums: [],
    };
  }
};

export const transformMusicToNow = async (
  items: LastFmArtist[],
  type: 'artist' | 'album',
): Promise<NowMediaItem[]> => {
  const transformedItems: NowMediaItem[] = [];
  for await (const item of items) {
    const name = item.name ?? '';
    const theArtist = await sdk.search(name, [type], 'GB', 1);
    const spotifyImage = theArtist.artists?.items[0]?.images?.[0]?.url;
    const fallbackImage = item.image?.[item.image.length - 1]?.['#text'];
    const image = spotifyImage || fallbackImage;

    if (image) {
      transformedItems.push({
        title: name,
        description: item.artist?.name,
        link: item.url,
        image,
      });
    }
  }
  return transformedItems;
};
