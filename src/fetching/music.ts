import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import axios from 'axios';
import urlJoin from 'proper-url-join';
import type { NowMediaItem } from 'src/types';

export interface Env {
  LASTFM_API_KEY: string;
}

const sdk = SpotifyApi.withClientCredentials(import.meta.env.SPOTIFY_CLIENT_ID, import.meta.env.SPOTIFY_CLIENT_SECRET, ["user-top-read"]);

export const fetchMusic = async (limit = 5) => {
  const topArtistsPath = urlJoin('https://ws.audioscrobbler.com/2.0/', {
    query: {
      method: 'user.gettopartists',
      user: 'martineau',
      api_key: import.meta.env.LASTFM_API_KEY as string,
      format: 'json',
      limit,
      period: '1month',
    },
  });

  const topAlbumsPath = urlJoin('https://ws.audioscrobbler.com/2.0/', {
    query: {
      method: 'user.gettopalbums',
      user: 'martineau',
      api_key: import.meta.env.LASTFM_API_KEY as string,
      format: 'json',
      limit,
      period: '1month',
    },
  });

  let topArtists:unknown;
  let topAlbums:unknown;

  try {
    topArtists = await axios.get(topArtistsPath);
    topAlbums = await axios.get(topAlbumsPath);
  } catch (err) {
    console.log(`🚀 ~ fetchMusic ~ err:`, err)
  }

  return {
    // @ts-expect-error
    topArtists: topArtists?.data?.topartists.artist ?? [],
    // @ts-expect-error
    topAlbums: topAlbums?.data?.topalbums.album ?? [],
  };
};

export const transformMusicToNow = async (items: unknown[], type: 'artist' | 'album'): Promise<NowMediaItem[]> => {
  const transformedItems: NowMediaItem[] = []
  for await (const item of items) {
    // @ts-expect-error
    const name = item?.name ?? ''
    const theArtist = await sdk.search(name, [type], 'GB', 1);
    // @ts-expect-error
    const image = theArtist.artists?.items[0].images.length > 0 ? theArtist.artists?.items[0].images[0].url : item?.image[item?.image?.length - 1]['#text'];

    if (image) {
      transformedItems.push({
        title: name,
        // @ts-expect-error
        description: item?.artist?.name,
        // @ts-expect-error
        link: item?.url,
        image,
      });
    }
  }
  return transformedItems
}
