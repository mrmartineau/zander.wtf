import { Client } from '@notionhq/client';
import axios from 'axios';
import type { NowMediaItem } from 'src/types';

const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
});

export const fetchBooks = async (limit = 5): Promise<NowMediaItem[]> => {
  const booksFromNotion = await notion.databases.query({
    database_id: '88c86996386045a0af9c69c0e1a448f4',
    sorts: [
      {
        property: 'Status',
        direction: 'ascending',
      },
    ],
    filter: {
      or: [
        {
          property: 'Type',
          multi_select: { contains: 'Book' },
        },
        {
          property: 'Type',
          multi_select: { contains: 'Audiobook' },
        },
        {
          property: 'Type',
          multi_select: { contains: 'Graphic Novel' },
        },
      ],
    },
  });

  const currentBooksFromNotion = booksFromNotion.results?.filter(
    (book) => book.properties.Status.select.name === 'Now',
  );

  const readBooksFromNotion = booksFromNotion.results?.filter(
    (book) => book.properties.Status.select.name === 'Done',
  );

  const rawBooks = [...currentBooksFromNotion, ...readBooksFromNotion];
  console.log(`🚀 ~ fetchBooks ~ rawBooks:`, rawBooks);
  const simplifiedBooks: NowMediaItem[] = [];
  for (const book of rawBooks) {
    simplifiedBooks.push({
      title: book?.properties?.Name.title[0]?.plain_text,
      image: `https://covers.openlibrary.org/b/isbn/${book?.properties?.ID.rich_text[0]?.plain_text}-L.jpg`,
    });
  }

  const response = simplifiedBooks.slice(0, limit);
  return response;
};
