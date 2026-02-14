/**
 * ASCII box-drawing layout
 *
 * Provides a `Box` class for building framed ASCII layouts with
 * box-drawing characters. Supports full-width rows, split (two-column)
 * rows, horizontal dividers, and various border junction types.
 *
 * All content is HTML-aware: padding calculations strip HTML tags so
 * that <a> and <span> elements don't break alignment.
 *
 * **Width model (important):**
 * `width` is the total inner content width between the two outer border
 * characters. A full-width row looks like:
 *
 *     ║<── width chars ──>║
 *
 * A split row has a middle border that *consumes 1 char of inner width*:
 *
 *     ║<─ left ─>║<─ right ─>║
 *     where left + 1 + right = width
 *
 * So `rightWidth = width - leftWidth - 1`. The caller only needs to
 * specify `leftWidth`; the class handles the rest.
 *
 * @example
 *   const box = new Box(72);
 *   box.top();
 *   box.row('  Hello world');
 *   box.divider();
 *   box.splitRow('  Left col', '  Right col', 35);
 *   box.bottom();
 *   const output = box.toString();
 */

import { center, pad, repeat } from './text';

/** Box-drawing character sets */
export const BORDERS = {
  double: {
    h: '═',
    v: '║',
    tl: '╔',
    tr: '╗',
    bl: '╚',
    br: '╝',
    ml: '╠',
    mr: '╣',
    tm: '╦',
    bm: '╩',
    cross: '╬',
  },
  single: {
    h: '─',
    v: '│',
    tl: '┌',
    tr: '┐',
    bl: '└',
    br: '┘',
    ml: '├',
    mr: '┤',
    tm: '┬',
    bm: '┴',
    cross: '┼',
  },
  rounded: {
    h: '─',
    v: '│',
    tl: '╭',
    tr: '╮',
    bl: '╰',
    br: '╯',
    ml: '├',
    mr: '┤',
    tm: '┬',
    bm: '┴',
    cross: '┼',
  },
} as const;

export type BorderStyle = keyof typeof BORDERS;

export class Box {
  private lines: string[] = [];
  private b: (typeof BORDERS)[BorderStyle];

  /**
   * @param width       Total inner width (between the left and right border chars).
   *                    For split rows, the middle border takes 1 char from this budget.
   * @param borderStyle Which border character set to use (default: 'double')
   */
  constructor(
    public readonly width: number,
    borderStyle: BorderStyle = 'double',
  ) {
    this.b = BORDERS[borderStyle];
  }

  /**
   * Compute the right column width for a given left column width.
   * Accounts for the middle border character.
   */
  rightWidth(leftWidth: number): number {
    return this.width - leftWidth - 1;
  }

  /** Get the accumulated lines */
  getLines(): string[] {
    return this.lines;
  }

  /** Render all lines as a single string */
  toString(): string {
    return this.lines.join('\n');
  }

  /** Add a raw pre-built line */
  push(line: string): this {
    this.lines.push(line);
    return this;
  }

  /** Add multiple raw lines */
  pushAll(newLines: string[]): this {
    this.lines.push(...newLines);
    return this;
  }

  // ── Borders ──────────────────────────────────────────────

  /** Top border: ╔════...════╗ */
  top(): this {
    this.lines.push(this.b.tl + repeat(this.b.h, this.width) + this.b.tr);
    return this;
  }

  /** Bottom border: ╚════...════╝ */
  bottom(): this {
    this.lines.push(this.b.bl + repeat(this.b.h, this.width) + this.b.br);
    return this;
  }

  /** Full-width horizontal divider: ╠════...════╣ */
  divider(): this {
    this.lines.push(this.b.ml + repeat(this.b.h, this.width) + this.b.mr);
    return this;
  }

  /**
   * Split horizontal divider with a junction character in the middle.
   * Total inner width is preserved: leftWidth + 1 (junction) + rightWidth = width.
   *
   * @param junction  The middle character — typically '╦', '╬', or '╩'
   * @param leftWidth Width of the left column
   */
  splitDivider(
    junction: '╦' | '╬' | '╩' | '┬' | '┼' | '┴' | string,
    leftWidth: number,
  ): this {
    const rw = this.rightWidth(leftWidth);
    this.lines.push(
      this.b.ml +
        repeat(this.b.h, leftWidth) +
        junction +
        repeat(this.b.h, rw) +
        this.b.mr,
    );
    return this;
  }

  // ── Rows ─────────────────────────────────────────────────

  /** Full-width content row: ║ content ...padding... ║ */
  row(content: string): this {
    this.lines.push(this.b.v + pad(content, this.width) + this.b.v);
    return this;
  }

  /** Empty full-width row */
  empty(): this {
    this.lines.push(this.b.v + ' '.repeat(this.width) + this.b.v);
    return this;
  }

  /** Full-width row with centered content */
  centeredRow(content: string): this {
    this.lines.push(this.b.v + center(content, this.width) + this.b.v);
    return this;
  }

  /**
   * Two-column split row: ║ left ...pad... ║ right ...pad... ║
   *
   * The middle ║ is included in the total inner width budget, so:
   * leftWidth + 1 + rightWidth = this.width
   *
   * @param left      Left column content
   * @param right     Right column content
   * @param leftWidth Width of the left column
   */
  splitRow(left: string, right: string, leftWidth: number): this {
    const rw = this.rightWidth(leftWidth);
    this.lines.push(
      this.b.v +
        pad(left, leftWidth) +
        this.b.v +
        pad(right, rw) +
        this.b.v,
    );
    return this;
  }

  /** Empty split row */
  emptySplit(leftWidth: number): this {
    const rw = this.rightWidth(leftWidth);
    this.lines.push(
      this.b.v +
        ' '.repeat(leftWidth) +
        this.b.v +
        ' '.repeat(rw) +
        this.b.v,
    );
    return this;
  }

  // ── Bulk helpers ─────────────────────────────────────────

  /**
   * Add multiple full-width rows from an array of content strings.
   * Useful for multi-line figlet output.
   */
  rows(contents: string[]): this {
    for (const c of contents) {
      this.row(c);
    }
    return this;
  }

  /**
   * Add paired split rows from two arrays, aligning them side by side.
   * If one array is shorter, empty strings are used for the missing side.
   *
   * @param leftLines  Array of left-column content strings
   * @param rightLines Array of right-column content strings
   * @param leftWidth  Width of the left column
   */
  splitRows(
    leftLines: string[],
    rightLines: string[],
    leftWidth: number,
  ): this {
    const max = Math.max(leftLines.length, rightLines.length);
    for (let i = 0; i < max; i++) {
      this.splitRow(leftLines[i] ?? '', rightLines[i] ?? '', leftWidth);
    }
    return this;
  }
}
