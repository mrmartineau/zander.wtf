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
