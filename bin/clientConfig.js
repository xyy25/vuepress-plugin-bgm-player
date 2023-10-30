import BgMusic from './BgMusic.vue';
import Music from "./page/Layout.vue";
import { defineClientConfig } from '@vuepress/client';

export default defineClientConfig({
  enhance: async ({ app }) => {
    app.component('BgMusic', BgMusic);
  },
  layouts: { Music },
  rootComponents: [BgMusic]
});
