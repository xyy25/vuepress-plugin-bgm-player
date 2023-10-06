import { path, getDirname } from "@vuepress/utils";

const __dirname = getDirname(import.meta.url);

/**
 * @typedef { import("./index").BgPlayerOptions } BgPlayerOptions
 * @param { Partial<BgPlayerOptions> } options
 * @param { any } [context]
*/
export default (options, context) => ({
  define () {
    const {
      defaultCover,
      position,
      draggable,
      audios,
      autoplay,
      autoShrink,
      shrinkMode,
      floatPosition,
      floatStyle
    } = options ?? {};

    const initPosition =  {
      ...(position ?? {}),
      left: position.right ? undefined : position.left ?? '10px',
      bottom: position.top ? undefined : position.bottom ?? '10px',
      'z-index': '40'
    }

    return {
      __DEFAULT_COVER__: defaultCover || path.resolve(__dirname, "./images/default.jpg"),
      __INIT_POSITION__: initPosition,
      __AUDIOS__: audios,
      __AUTOPLAY__: autoplay || false,
      __AUTO_SHRINK__: autoShrink || false,
      __DRAGGABLE__: draggable || true,
      __SHRINK_MODE__: shrinkMode || 'float',
      __FLOAT_POSITION__: floatPosition || 'left',
      __FLOAT_STYLE__: floatStyle || {
        bottom: '200px',
        'z-index': '40'
      }
    }
  },

  name: '@vuepress-reco/vuepress-plugin-bgm-player',
  multiple: true,
  clientConfigFile: path.resolve(__dirname, './bin/clientConfig.js'),
})
