// Reads an app's version history out of its App Store web page, at build
// time. Apple has no public API for this: the page embeds its data as JSON
// in #serialized-server-data, and the "Version History" sheet is in there.
// If Apple changes that shape this returns [] and warns, so the build still
// passes; the changelog page then points at the App Store instead.

export type AppVersion = { version: string; date: Date; notes: string[] };

type Paragraph = {
  text?: string;
  primarySubtitle: string;
  secondarySubtitle: string;
};

// Walks the JSON for the sheet the "Version History" button opens.
const findHistory = (node: unknown): Paragraph[] | undefined => {
  if (!node || typeof node !== 'object') return;
  const o = node as {
    page?: string;
    pageData?: { shelves?: { items?: Paragraph[] }[] };
  };
  if (o.page === 'versionHistory') return o.pageData?.shelves?.[0]?.items;
  for (const v of Object.values(o)) {
    const found = findHistory(v);
    if (found) return found;
  }
};

export const getAppVersions = async (url: string): Promise<AppVersion[]> => {
  try {
    const html = await (await fetch(url)).text();
    const json = html.match(
      /<script type="application\/json" id="serialized-server-data">([\s\S]*?)<\/script>/,
    )?.[1];
    const items = json ? findHistory(JSON.parse(json)) : undefined;
    if (!items?.length) throw new Error('no version history in the page');
    return items.map((item) => ({
      version: item.primarySubtitle,
      date: new Date(item.secondarySubtitle),
      notes: (item.text ?? '')
        .split(/\n\s*\n/)
        .map((p) => p.trim())
        .filter(Boolean),
    }));
  } catch (error) {
    console.warn(`App Store version history (${url}):`, error);
    return [];
  }
};
