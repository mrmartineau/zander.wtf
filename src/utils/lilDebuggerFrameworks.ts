// Install snippets for /lil-debugger. They live in a .ts file, not the page, because
// Vite's dependency scan reads every <script> in an .astro file, even inside strings.
export const frameworks: [
  name: string,
  lang: 'html' | 'astro' | 'tsx' | 'vue' | 'svelte',
  code: string,
][] = [
  [
    'Plain HTML',
    'html',
    `<!-- No build step: load it from a CDN, and only on the pages you debug -->
<script type="module">
  import { lilDebugger } from "https://esm.sh/@mrmartineau/lil-debugger@1";

  lilDebugger();
</script>`,
  ],
  [
    'Astro',
    'astro',
    `<script>
  import { lilDebugger } from "@mrmartineau/lil-debugger";

  if (import.meta.env.DEV) lilDebugger();
</script>`,
  ],
  [
    'React',
    'tsx',
    `import { useEffect } from "react";
import { lilDebugger } from "@mrmartineau/lil-debugger";

export function LilDebugger() {
  useEffect(() => lilDebugger().destroy, []);
  return null;
}`,
  ],
  [
    'Vue',
    'vue',
    `<script setup>
import { onMounted, onUnmounted } from "vue";
import { lilDebugger } from "@mrmartineau/lil-debugger";

let debug;
onMounted(() => (debug = lilDebugger()));
onUnmounted(() => debug?.destroy());
</script>`,
  ],
  [
    'Svelte',
    'svelte',
    `<script>
  import { onMount } from "svelte";
  import { lilDebugger } from "@mrmartineau/lil-debugger";

  onMount(() => lilDebugger().destroy);
</script>`,
  ],
  [
    'Solid',
    'tsx',
    `import { onCleanup, onMount } from "solid-js";
import { lilDebugger } from "@mrmartineau/lil-debugger";

export function LilDebugger() {
  onMount(() => onCleanup(lilDebugger().destroy));
  return null;
}`,
  ],
];
