import { describe, expect, it } from 'vitest';
import {
  markdownToPlainText,
  sqlEscape,
} from '../../scripts/build-search-index';
import { toFtsQuery } from './search';

describe('toFtsQuery', () => {
  it('quotes terms and adds prefix wildcard to the last one', () => {
    expect(toFtsQuery('astro search')).toBe('"astro" "search"*');
  });

  it('handles a single term', () => {
    expect(toFtsQuery('css')).toBe('"css"*');
  });

  it('neutralises FTS operators', () => {
    expect(toFtsQuery('AND')).toBe('"AND"*');
    expect(toFtsQuery('NEAR(')).toBe('"NEAR("*');
    expect(toFtsQuery('a-b')).toBe('"a-b"*');
  });

  it('strips quotes and backticks', () => {
    expect(toFtsQuery('"astro"')).toBe('"astro"*');
    expect(toFtsQuery("it's")).toBe('"it" "s"*');
    expect(toFtsQuery('`code`')).toBe('"code"*');
  });

  it('returns empty match for empty/whitespace input', () => {
    expect(toFtsQuery('')).toBe('""');
    expect(toFtsQuery('   ')).toBe('""');
    expect(toFtsQuery('"\'`')).toBe('""');
  });

  it('caps the number of terms at 8', () => {
    const query = toFtsQuery('a b c d e f g h i j');
    expect(query.split(' ')).toHaveLength(8);
  });
});

describe('sqlEscape', () => {
  it('doubles single quotes', () => {
    expect(sqlEscape("it's a test")).toBe("it''s a test");
  });

  it('leaves other characters alone', () => {
    expect(sqlEscape('hello "world" `x`')).toBe('hello "world" `x`');
  });
});

describe('markdownToPlainText', () => {
  it('strips markdown syntax but keeps text', () => {
    expect(
      markdownToPlainText(
        '# Title\n\nSome **bold** and [a link](https://x.com).',
      ),
    ).toBe('Title Some bold and a link.');
  });

  it('keeps code inside fences, drops the fence lines', () => {
    expect(markdownToPlainText('```ts\nconst a = 1\n```')).toBe('const a = 1');
  });

  it('strips MDX imports and JSX tags', () => {
    expect(
      markdownToPlainText(
        'import Foo from \'./Foo\'\n\n<Foo prop="1" />\ntext',
      ),
    ).toBe('text');
  });
});
