const postcss = require('postcss');

// Only the site's own CSS goes through Tailwind v3. The EmDash admin ships
// prebuilt CSS (Tailwind v4 layers) that v3 rejects.
const siteCss = postcss([
  require('postcss-import'),
  require('tailwindcss/nesting'),
  require('tailwindcss'),
]);

module.exports = {
  plugins: [
    {
      postcssPlugin: 'site-css-only',
      async Once(root, { result }) {
        const from = root.source?.input.file;
        if (from?.includes('node_modules')) return;
        const { messages } = await siteCss.process(root, {
          ...result.opts,
          from,
        });
        result.messages.push(...messages);
      },
    },
  ],
};
