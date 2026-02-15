/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Env {
  ALGOLIA_APP: string;
  ALGOLIA_SEARCH_KEY: string;
  ALGOLIA_INDEX: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
