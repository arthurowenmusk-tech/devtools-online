// @ts-check
import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://xianghome.site', // Dev/test domain, replace for production
  integrations: [vue()],
  markdown: {
    shikiConfig: {
      theme: 'github-dark',
    },
  },
});
