/**
 * ASCII figlet banner generation
 *
 * Wraps the `figlet` package to generate ASCII art text banners.
 * Returns arrays of lines that can be fed directly into a Box layout.
 *
 * Fonts are loaded via figlet's importable-fonts so they're bundled
 * into the build output and work in all environments (including
 * Cloudflare workers where filesystem access is unavailable).
 */

import figlet from 'figlet';

// Pre-load bundleable font data so figlet never touches the filesystem
import ansiShadow from 'figlet/importable-fonts/ANSI Shadow.js';
import calvinS from 'figlet/importable-fonts/Calvin S.js';
import doom from 'figlet/importable-fonts/Doom.js';
import slant from 'figlet/importable-fonts/Slant.js';
import small from 'figlet/importable-fonts/Small.js';
import smallSlant from 'figlet/importable-fonts/Small Slant.js';
import standard from 'figlet/importable-fonts/Standard.js';

/** Handle CJS/ESM interop: imports may be `{ default: string }` or plain `string` */
const resolve = (mod: any): string => mod.default ?? mod;

/** Map of pre-loaded font names → font data */
const FONT_DATA: Record<string, string> = {
  'ANSI Shadow': resolve(ansiShadow),
  Standard: resolve(standard),
  Small: resolve(small),
  Doom: resolve(doom),
  'Calvin S': resolve(calvinS),
  Slant: resolve(slant),
  'Small Slant': resolve(smallSlant),
};

// Register all pre-loaded fonts with figlet
for (const [name, data] of Object.entries(FONT_DATA)) {
  figlet.parseFont(name, data);
}

/** Pre-loaded font names that are guaranteed to work */
export type FigletFont = keyof typeof FONT_DATA | (string & {});

export interface BannerOptions {
  /** Figlet font to use (default: 'ANSI Shadow') */
  font?: FigletFont;
  /**
   * Horizontal layout: 'default', 'full', 'fitted', 'controlled smushing',
   * or 'universal smushing' (default: 'fitted')
   */
  horizontalLayout?: figlet.KerningMethods;
}

/**
 * Generate an ASCII art banner from text.
 * Returns an array of strings, one per line of the banner.
 *
 * Uses pre-loaded fonts so it works synchronously in all environments.
 *
 * @example
 *   const lines = banner('ZANDER');
 *   // => ['███████╗ █████╗ ...', '╚══███╔╝██╔══██╗...', ...]
 *
 *   const lines = banner('HI', { font: 'Doom' });
 */
export function banner(text: string, options: BannerOptions = {}): string[] {
  const { font = 'ANSI Shadow', horizontalLayout = 'fitted' } = options;

  const result = figlet.textSync(text, {
    font: font as figlet.Fonts,
    horizontalLayout,
  });

  // Split into lines and remove trailing empty lines
  const lines = result.split('\n');
  while (lines.length > 0 && lines[lines.length - 1].trim() === '') {
    lines.pop();
  }

  return lines;
}

/**
 * Generate a banner and prefix each line with padding (e.g. for indentation).
 *
 * @example
 *   const lines = paddedBanner('ZANDER', '  ');
 *   // Each line starts with '  '
 */
export function paddedBanner(
  text: string,
  prefix = '  ',
  options: BannerOptions = {},
): string[] {
  return banner(text, options).map((line) => prefix + line);
}

/**
 * Get the width (in characters) of the widest line in a banner.
 */
export function bannerWidth(text: string, options: BannerOptions = {}): number {
  const lines = banner(text, options);
  return Math.max(0, ...lines.map((l) => l.length));
}
