// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://tool.xianghome.site',
  integrations: [vue()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
