import BgMusic from './BgMusic.vue'
import { defineClientConfig } from '@vuepress/client';

export default defineClientConfig({
  enhance: async ({ app }) => {
    app.component('BgMusic', BgMusic);
  },
  rootComponents: __GLOBAL__ ? [BgMusic] : undefined
});
