import { computed, ref } from "vue";
import type { Audio, RequiredAudio } from "../../index";

declare const __VUEPRESS_SSR__: boolean;
declare const __DEFAULT_COVER__: string;
declare const __AUDIOS__: RequiredAudio[];

export interface ResolvedAudios {
  audios: Audio[];
  asyncAudios: Promise<Audio[]>[];
}

const mapFunc = (obj: any): Audio => ({
  name: obj.name || obj.title || '未知歌曲',
  artist: obj.artist || obj.author || '未知歌手',
  url: obj.url || obj.src,
  cover: obj.pic,
  lrc: obj.lrc || obj.lyric || '',
});

function resolveAudios(requiredAudio: RequiredAudio[]): ResolvedAudios {
  let files: Record<string, string> | null = null;
  let covers: Record<string, string> | null = null;
  let lrcs: Record<string, string> | null = null;

  const syn: Audio[] = [], asyn: Promise<Audio[]>[] = [];
  for(const e of requiredAudio) {
    if(!("type" in e)) {
      syn.push(e);
      continue;
    }

    switch(e.type) {
      case "dir": {
        // 获取静态目录下相应目录的音乐(由于glob无法使用变量，所以只能手动填写相对路径了)
        if (!files) files = import.meta.glob('../../../../public/music/**/*.mp3', { eager: true });
        if (!covers) covers = import.meta.glob('../../../../public/music/**/*.png', { eager: true });
        if (!lrcs) lrcs = import.meta.glob('../../../../public/music/**/*.lrc', { eager: true });

        syn.push(...Object.keys(files).map(m => {
          const reg = new RegExp(`.*public(${e.url}(.+?)( - (.+))?\\.mp3)`);
          const match = m.match(reg)!;
          const coverUrl = m.replace(".mp3", ".png");
          const lrcUrl = m.replace(".mp3", ".lrc");

          return {
            name: match[2] ?? '未知歌曲',
            artist: match[4] ?? '未知歌手',
            url: match[1],
            cover: coverUrl in covers! ? coverUrl : __DEFAULT_COVER__,
            lrc: lrcUrl in lrcs! ? lrcUrl : undefined
          }
        }));
        break;
      }
      case "remote": {
        if(__VUEPRESS_SSR__) {
          break;
        }
        const params = {
          server: e.from,
          type: 'playlist',
          id: e.mid,
          r: Math.random(),
        }

        let url = e.api, paramsArr: string[] = [];
        Object.keys(params).forEach((key) => paramsArr.push(key + '=' + params[key]));
        url += '?' + paramsArr.join('&');

        const headers: any = { referer: null };
        const prom = fetch(url, { headers })
          .then((res) => res.json())
          .then((result) => {
            console.log(url, result);

            const mapped: Audio[] = result.map(mapFunc);
            return mapped;
        });
        asyn.push(prom);
        break;
      }
    }
  }

  return {
    audios: syn,
    asyncAudios: asyn
  };
}

const audioList = ref<Audio[]>([{ name: '音乐加载中..', artist: '', url: '', cover: __DEFAULT_COVER__ }]);
const curIndex = ref(0);
const curAudio = computed(() => audioList.value[curIndex.value]);
const httpEnd = ref(false);

const { audios, asyncAudios } = resolveAudios(__AUDIOS__);
let inited = false;
if(audios && audios.length) {
  audioList.value = audios;
  inited = true;
  httpEnd.value = !audios.length;
}
Promise.all(asyncAudios).then(res => {
  if(!inited) {
    audioList.value = [];
    inited = true;
  }
  audioList.value.push(...res.flat());
  httpEnd.value = true;
});

export const useAudioList = () => audioList;
export const useCurIndex = () => curIndex;
export const useCurAudio = () => curAudio;
export const useHttpEnd = () => httpEnd;
