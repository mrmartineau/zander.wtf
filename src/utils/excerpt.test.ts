import { describe, expect, it } from 'vitest';
import { excerpt } from './excerpt';

describe('excerpt', () => {
  it('strips Markdown down to prose', () => {
    expect(
      excerpt('# Heading\n\nSome **bold** text with a [link](https://a.b).'),
    ).toBe('Heading Some bold text with a link.');
  });

  it('drops fenced code blocks and images', () => {
    expect(excerpt('Intro.\n\n```js\nconst a = 1\n```\n\n![alt](/a.png)')).toBe(
      'Intro.',
    );
  });

  it('cuts on a word boundary and appends an ellipsis', () => {
    const result = excerpt('word '.repeat(50));
    expect(result.length).toBeLessThanOrEqual(156);
    expect(result.endsWith('…')).toBe(true);
    expect(result).not.toMatch(/wor…$/);
  });

  it('leaves short text alone', () => {
    expect(excerpt('Short one.')).toBe('Short one.');
  });
});
