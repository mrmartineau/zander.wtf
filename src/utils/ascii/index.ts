/**
 * ASCII layout utilities
 *
 * A small toolkit for building ASCII/box-drawing layouts that render
 * as HTML inside <pre> tags. Designed for Astro build-time generation.
 *
 * @example
 *   import { Box, banner, span, link, trunc, pad } from '~/utils/ascii';
 *
 *   const art = banner('ZANDER');
 *   const box = new Box(72);
 *   box.top();
 *   box.rows(art.map(line => '  ' + span('accent', line)));
 *   box.divider();
 *   box.row('  ' + link('/blog', 'Visit the blog'));
 *   box.bottom();
 *   const html = box.toString();
 */

export { Box, BORDERS, type BorderStyle } from './box';
export {
  banner,
  paddedBanner,
  bannerWidth,
  type BannerOptions,
  type FigletFont,
} from './figlet';
export { span, link, accent, dim, bright, shortcut } from './html';
export { stripTags, visLen, trunc, pad, padLeft, center, repeat } from './text';

