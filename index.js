import { path, getDirname } from "@vuepress/utils";

const __dirname = getDirname(import.meta.url);

/**
 * @typedef { import(".").Audio } Audio
 * @param { import(".").BgPlayerOptions & { audios: Audio[] } } options
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

    const initPosition =  {
      ...(position ?? {}),
      left: position.right ? undefined : position.left ?? '10px',
      bottom: position.top ? undefined : position.bottom ?? '10px',
      'z-index': '999999'
    }

    return {
      DEFAULT_COVER: defaultCover || path.resolve(__dirname, "./images/default.jpg"),
      POSITION: initPosition,
      AUDIOS: audios,
      AUTOPLAY: autoplay || false,
      AUTO_SHRINK: autoShrink || false,
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
