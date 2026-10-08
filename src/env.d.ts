/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

interface Env {
  SEARCH_DB: D1Database;
  REACTIONS_DB: D1Database;
  REACTIONS_ADMIN_TOKEN?: string;
}

type Runtime = import('@astrojs/cloudflare').Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {}
}
