import { SpotifyApi } from '@spotify/web-api-ts-sdk';
import axios from 'axios';
import urlJoin from 'proper-url-join';
import type { NowMediaItem } from 'src/types';

export interface Env {
  LASTFM_API_KEY: string;
}

// const sdk = SpotifyApi.withClientCredentials(import.meta.env.SPOTIFY_CLIENT_ID, import.meta.env.SPOTIFY_CLIENT_SECRET, ["user-top-read"]);

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
  // const topArtistsPath = urlJoin('https://api.spotify.com/v1/me/top/artists', {
  //   query: {
  //     time_range: 'short_term',
  //     user: 'martineau',
  //     limit,
  //   },
  // });

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
  let artistImages
  try {
    for await (const artist of topArtists?.data?.topartists.artist) {
      const artistInfo = await axios.get(urlJoin('https://ws.audioscrobbler.com/2.0/', {
        query: {
          method: 'artist.getinfo',
          api_key: import.meta.env.LASTFM_API_KEY as string,
          format: 'json',
          artist: artist.name
        },
      }))
      console.log(`🚀 ~ forawait ~ artistInfo:`, JSON.stringify(artistInfo.data.artist.image))
    }
  } catch (error) {

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
