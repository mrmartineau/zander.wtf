// Shared by the /api/reactions route and the Reactions component.

export type Highlight = {
  id: number;
  text: string;
  start: number;
  city: string | null;
  country: string | null;
  createdAt: number;
  mine: boolean;
};

export type Reactions = {
  views: number;
  hearts: number;
  myHearts: number;
  highlights: Highlight[];
  /** The request carried the right admin token: every highlight can be deleted. */
  admin: boolean;
};

export const MAX_HEARTS = 10; // per reader per page
export const MAX_TEXT = 1000;

const regions = new Intl.DisplayNames(['en'], { type: 'region' });

// Cloudflare also sends XX (unknown) and T1 (Tor), which aren't countries.
const knownCountry = (country: string | null) =>
  country && /^[A-Z]{2}$/.test(country) && country !== 'XX' ? country : null;

/** "London, United Kingdom", or as much of it as we know. */
export const place = (city: string | null, country: string | null) => {
  const known = knownCountry(country);
  return [city, known && regions.of(known)].filter(Boolean).join(', ');
};

/** GB → 🇬🇧: each letter maps to a regional indicator symbol. */
export const flag = (country: string | null) => {
  const known = knownCountry(country);
  return known
    ? String.fromCodePoint(...[...known].map((c) => 0x1f1a5 + c.charCodeAt(0)))
    : '';
};

/** How long ago a unix time was, short: "now", "14m", "2h", "3d". */
export const ago = (at: number, now = Date.now() / 1000) => {
  const s = Math.max(0, now - at);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

const rules = new Intl.PluralRules('en-GB');

/** The word for n: plural(1, 'mark', 'marks') is "mark", plural(6, …) "marks". */
export const plural = (n: number, one: string, other: string) =>
  rules.select(n) === 'one' ? one : other;
