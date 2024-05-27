import { getCollection, type CollectionEntry } from 'astro:content';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { ImageResponse } from '@vercel/og';
import { SITE_METADATA } from 'src/consts';

interface Props {
  params: { slug: string };
  props: { post: CollectionEntry<'blog'> };
}

export const GET = async ({ props }: Props) => {
  const { post } = props;

  const MonaSansBoldItalic = readFileSync(
    resolve('./public/fonts/MonaSansExpanded-ExtraBoldItalic.ttf'),
  );
  const MonaSansLight = readFileSync(
    resolve('./public/fonts/MonaSansExpanded-Light.ttf'),
  );

  const title = post.data.title ?? '';
  const subtitle = post.data.subtitle ?? '';
  const date = post.data.date ?? '';

  // Astro doesn't support .tsx endpoints so using React-element objects
  const html = {
    type: 'div',
    props: {
      children: [
        {
          type: 'div',
          props: {
            tw: 'flex flex-col gap-2',
            children: [
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '75px',
                    fontFamily: 'Mona Sans',
                    color: '#ffd200',
                    fontWeight: 700,
                    fontStyle: 'italic',
                    lineHeight: '1',
                    marginBottom: '0.2em',
                  },
                  children: title,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '35px',
                    fontFamily: 'Mona Sans',
                    color: '#fff',
                    lineHeight: '1.3',
                    fontWeight: 300,
                  },
                  children: subtitle,
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontSize: '25px',
                    fontFamily: 'Mona Sans',
                    lineHeight: '1.4',
                    fontWeight: 300,
                  },
                  children:
                    date &&
                    date.toLocaleDateString('en-gb', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }),
                },
              },
            ],
          },
        },
        {
          type: 'div',
          props: {
            tw: 'absolute right-[30px] bottom-[30px] flex gap-x-0.5 items-center text-3xl',
            children: [
              {
                type: 'div',
                props: {
                  tw: '',
                  style: {
                    fontFamily: 'Mona Sans',
                    color: '#ffd200',
                    fontWeight: 700,
                    fontStyle: 'italic',
                  },
                  children: 'Zander Martineau',
                },
              },
              {
                type: 'div',
                props: {
                  tw: '',
                  style: {
                    fontFamily: 'Mona Sans',
                    fontWeight: 300,
                    marginLeft: '0.5em',
                    marginRight: '0.5em',
                  },
                  children: '•',
                },
              },
              {
                type: 'div',
                props: {
                  style: {
                    fontFamily: 'Mona Sans',
                    fontWeight: 300,
                  },
                  children: 'zander.wtf',
                },
              },
            ],
          },
        },
        {
          type: 'svg',
          props: {
            tw: 'absolute right-0 top-0 left-0',
            viewBox: '0 296 2212 296',
            fill: '#fff',
            style: {
              height: '160px',
              width: '1200px',
            },
            children: [
              {
                type: 'path',
                props: {
                  d: 'M0 592h327.343V464.505H163.265L327.343 113.69V0H10.559v128.307h152.706L0 479.122V592ZM351.266 592h142.147l11.371-97.449h79.602L596.57 592h142.147L646.118 0H442.24l-90.974 592Zm164.89-211.139 14.621-124.246 10.559-121.811h5.686l12.184 120.998 12.996 125.059h-56.046ZM763.275 592h133.211V464.505l-7.31-163.227h4.874L959.843 592h151.897V0H978.525v125.059l7.31 169.723h-5.685L916.793 0H763.275v592ZM1157.51 592h131.59c190.07 0 230.68-120.999 230.68-295.594C1519.78 77.146 1443.43 0 1289.1 0h-131.59v592Zm145.39-127.495v-337.01h12.19c43.86 0 58.48 38.98 58.48 165.663 0 114.502-8.12 171.347-58.48 171.347h-12.19ZM1554.12 592h269.67V464.505h-125.9V349.191h114.53V230.628h-114.53V127.495h125.9V0h-269.67v592ZM1861.1 592h145.4V390.606h20.3c27.62 0 28.43 34.107 28.43 62.53v87.704c0 10.556 1.63 34.919 6.5 51.16h147.02c-3.25-17.053-5.69-34.919-5.69-60.093v-95.013c0-58.469-13.8-111.253-59.29-119.374v-5.685c41.43-14.617 68.23-62.529 68.23-139.676C2212 39.791 2136.46 0 2024.37 0H1861.1v592Zm145.4-315.084V127.495h9.74c34.93 0 49.55 19.49 49.55 74.711 0 47.912-8.93 74.71-48.73 74.71h-10.56Z',
                },
              },
            ],
          },
        },
      ],
      tw: 'w-full h-full flex flex-col relative p-15 pt-[200px]',
      style: {
        background: 'hsl(214 14% 15%)',
        fontFamily: 'Mona Sans',
        color: 'rgba(255, 255, 255, 0.75)',
      },
    },
  };

  return new ImageResponse(html, {
    width: 1200,
    height: 600,
    fonts: [
      {
        name: 'Mona Sans',
        data: MonaSansBoldItalic.buffer,
        style: 'italic',
        weight: 700,
      },
      {
        name: 'Mona Sans',
        data: MonaSansLight.buffer,
        style: 'normal',
        weight: 300,
      },
    ],
  });
};

export async function getStaticPaths() {
  const blogPosts = await getCollection('blog');
  const otherPages = Object.keys(SITE_METADATA).map((item) => {
    return {
      slug: item,
      data: {
        title: SITE_METADATA[item].ogTitle ?? SITE_METADATA[item].title,
        subtitle: SITE_METADATA[item].subtitle,
      },
    };
  });

  const allPages = [...blogPosts, ...otherPages];
  return allPages.map((post) => ({
    params: { slug: post.slug },
    props: { post },
  }));
}
