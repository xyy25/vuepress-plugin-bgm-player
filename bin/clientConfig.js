import BgMusic from './BgMusic.vue'
import { defineClientConfig } from '@vuepress/client';

export default defineClientConfig({
  enhance: async ({ app }) => {
    app.component('BgMusic', BgMusic);
  },
  rootComponents: [BgMusic]
});
