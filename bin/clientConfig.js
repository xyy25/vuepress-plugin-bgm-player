import BgMusic from './BgMusic.vue';
import Music from "./page/Layout.vue";
import { defineClientConfig } from '@vuepress/client';
import directivesPlugin from "./page/directive";

export default defineClientConfig({
  enhance: async ({ app }) => {
    app.component('BgMusic', BgMusic);
    app.use(directivesPlugin);
  },
  layouts: { Music },
  rootComponents: [BgMusic]
});
