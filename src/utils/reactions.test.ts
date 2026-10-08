import { describe, expect, it } from 'vitest';
import { flag, place } from './reactions';

describe('place', () => {
  it('names the city and country', () => {
    expect(place('London', 'GB')).toBe('London, United Kingdom');
  });

  it('drops what Cloudflare does not know', () => {
    expect(place(null, 'AU')).toBe('Australia');
    expect(place('Lisbon', null)).toBe('Lisbon');
    expect(place(null, 'XX')).toBe('');
    expect(place(null, 'T1')).toBe('');
  });
});

describe('flag', () => {
  it('turns a country code into a flag emoji', () => {
    expect(flag('GB')).toBe('🇬🇧');
    expect(flag('T1')).toBe('');
    expect(flag(null)).toBe('');
  });
});
