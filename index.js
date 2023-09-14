import { path, getDirname } from "@vuepress/utils";

const __dirname = getDirname(import.meta.url);

/**
 * @param { import(".").BgPlayerOptions } [options]
 * @param { any } [context]
*/
export default (options, context) => ({
  define () {
    const {
      defaultCover,
      position,
      audios,
      autoplay,
      autoShrink,
      shrinkMode,
      floatPosition,
      floatStyle
    } = options ?? {};

    return {
      DEFAULT_COVER: defaultCover || path.resolve(__dirname, "./images/default.jpg"),
      POSITION: position || {
        left: '10px',
        bottom: '10px',
        'z-index': '999999'
      },
      AUDIOS: audios,
      AUTOPLAY: autoplay || false, // 是否开启自动播放
      AUTO_SHRINK: autoShrink || false, // 是否默认收缩
      SHRINK_MODE: shrinkMode || 'float',
      FLOAT_POSITION: floatPosition || 'left',
      FLOAT_STYLE: floatStyle || {
        bottom: '200px',
        'z-index': '999999'
      }
    }
  },

  name: '@vuepress-reco/vuepress-plugin-bgm-player',
  multiple: true,
  clientConfigFile: path.resolve(__dirname, './bin/clientConfig.js'),
})
