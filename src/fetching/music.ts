import axios from 'axios';
import urlJoin from 'proper-url-join';
import type { NowMediaItem } from 'src/types';

export interface Env {
  LASTFM_API_KEY: string;
}

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

export const transformMusicToNow = (items: unknown[]): NowMediaItem[] => {
  const transformedItems: NowMediaItem[] = []
  for (const item of items) {
      const image = item?.image[item?.image?.length - 1]['#text']
      console.log(`🚀 ~ transformMusicToNow ~ image:`, image)
      if (image) {
        transformedItems.push({
          title: item?.name,
          description: item?.artist?.name,
          link: item?.url,
          image,
        });
      }
    }
    return transformedItems
}
