import { Client } from '@notionhq/client';
import axios from 'axios';
import type { NowMediaItem } from 'src/types';

const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});

export const fetchShows = async (limit = 5) => {
  const currentTvShowsFromNotion = await notion.databases.query({
    database_id: '88c86996386045a0af9c69c0e1a448f4',
    filter: {
      and: [
        {
          property: 'Type',
          multi_select: { contains: 'TV' },
        },
        {
          property: 'Status',
          select: {
            equals: 'Now',
          },
        },
      ],
    },
  });
  const watchedTvShowsFromNotion = await notion.databases.query({
    database_id: '88c86996386045a0af9c69c0e1a448f4',
    filter: {
      and: [
        {
          property: 'Type',
          multi_select: { contains: 'TV' },
        },
        {
          property: 'Status',
          select: {
            equals: 'Done',
          },
        },
      ],
    },
  });
  const currentLength = currentTvShowsFromNotion.results?.length;
  const rawShows = currentTvShowsFromNotion.results;
  const watchedDelta = 5 - currentLength;
  if (watchedDelta > 0) {
    rawShows.push(...watchedTvShowsFromNotion.results.slice(0, watchedDelta));
  }

  const simplifiedTvShows = [];
  for (const show of rawShows) {
    const id = show?.properties?.ID.rich_text[0]?.plain_text;
    simplifiedTvShows.push({
      id,
      title: show.properties.Name.title[0]?.plain_text,
    });
  }

  const shows = [];
  for await (const show of simplifiedTvShows) {
    try {
      const { data } = await axios.get(
        `https://api.tvmaze.com/lookup/shows?thetvdb=${show.id}`,
      );
      shows.push(data);
    } catch (err) {
      console.error(err);
    }
  }

  return shows.slice(0, limit);
};

export const transformShowsToNow = (shows: unknown[]): NowMediaItem[] => {
  let transformedShows: NowMediaItem[] = [];
  for (const data of shows) {
    transformedShows.push({
      title: data.name,
      image: data.image.original,
      link: data.url,
    });
  }
  return transformedShows;
};
