// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://tool.xianghome.site',
  integrations: [vue()],

  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },

  adapter: cloudflare(),
});