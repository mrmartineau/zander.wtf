// Stands in for `cloudflare:workers` while pages prerender in Node. EmDash's
// middleware imports it, but prerendered pages never touch the bindings.
export const env = {};
export const waitUntil = () => {};
