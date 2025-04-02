import type { NowMediaItem } from 'src/types';

const podcasts: NowMediaItem[] = [
  {
    title: 'Hard Fork',
    link: 'https://www.nytimes.com/column/hard-fork',
    description: 'A weekly newsletter about the tech industry.',
    image:
      'https://static01.nyt.com/images/2022/09/28/podcasts/hard-fork-album-art/hard-fork-album-art-square320-v2.png',
  },
  {
    title: 'The Rest is Entertainment',
    link: 'https://podcasts.apple.com/gb/podcast/the-rest-is-entertainment/id1718287198',
    description:
      'The Rest Is Entertainment pulls back the curtain on television, movies, journalism and more with Richard Osman and Marina Hyde using their years of knowledge, enviable contact book and wit to bring you what’s hot, and what’s not in the world of entertainment.',
    image:
      'https://www.playpodcast.net/wp-content/uploads/2023/11/the-rest-is-entertainment-1.jpg',
  },
  {
    title: 'Darknet Diaries',
    link: 'https://darknetdiaries.com/',
    description: 'True stories from the dark side of the internet.',
    image:
      'https://is2-ssl.mzstatic.com/image/thumb/Music113/v4/3c/1d/6b/3c1d6bb8-246f-6895-112c-a2ecc3f5f547/source/1200x1200bb.png',
  },
  {
    title: 'The Rewatchables',
    link: 'https://www.theringer.com/the-rewatchables',
    description: 'A podcast about movies you can watch over and over again.',
    image: 'https://i.scdn.co/image/ab6765630000ba8ad2b134a6361264eae20a9388',
  },
  {
    title: 'The Ride Companion',
    link: 'https://theridecompanion.co.uk/',
    image: `https://i.scdn.co/image/ab6765630000ba8ad5e5193fa039b4c90ae57c57`,
  },
  {
    title: 'The Rick Shields Golf Show',
    link: 'https://www.rickshiels.com/podcast/',
    image:
      'https://is4-ssl.mzstatic.com/image/thumb/Podcasts115/v4/64/f9/3e/64f93e84-7f3f-17f5-32a5-18471b5c8e4a/mza_16223866303298787783.jpg/1200x1200bb.jpg',
  },
];

export const fetchPodcasts = async (limit = 3) => {
  return podcasts.slice(0, limit);
};
