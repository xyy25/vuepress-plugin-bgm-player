import BgMusic from './BgMusic.vue';
import { defineClientConfig } from '@vuepress/client';
import directivesPlugin from "./page/directive";

export default defineClientConfig({
  enhance: async ({ app }) => {
    app.component('BgMusic', BgMusic);
    app.use(directivesPlugin);
  },
  rootComponents: [BgMusic]
});
