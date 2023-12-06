import { computed, watch, ref, readonly } from "vue";
import type { Audio, RequiredAudio } from "../../index";
import { audioPause } from "./audioRef";

declare const __VUEPRESS_SSR__: boolean;
declare const __DEFAULT_COVER__: string;
declare const __AUDIOS__: RequiredAudio[];

export type PlayMode = "sequential" | "single" | "loop" | "random";
export interface ResolvedAudios {
  audios: Audio[];
  asyncAudios: Promise<Audio[]>[];
}

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
        const mapFunc = (obj: any): Audio => {
          const name = obj.name || obj.title || '未知歌曲';
          const url = e.replaceUrl?.[name]?.url || obj.url || obj.src;

          return {
            name, url,
            artist: obj.artist || obj.author || '未知歌手',
            cover: obj.pic,
            lrc: obj.lrc || obj.lyric || '',
          }
        };

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

const placeholderAudio: Audio = {
  name: '音乐加载中...',
  artist: '',
  url: '',
  cover: __DEFAULT_COVER__
};

const audioList = ref<Audio[]>([placeholderAudio]);
const curIndex = ref(0);
const curAudio = computed(() => audioList.value[curIndex.value] || placeholderAudio);
const httpEnd = ref(false);
const playMode = ref<PlayMode>("sequential");

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

let shuffledList: number[] = [];
let shuffledIndex: number = 0;
const genShuffledList = (audioList: Audio[], firstIndex: number | null = null): number[] => {
  const list = audioList.map((_, i) => i).sort(() => .5 - Math.random());
  if(firstIndex !== null) {
    const firstAt = list.indexOf(firstIndex);
    firstAt >= 0 && (list[firstAt] = list[0]);
    list[0] = firstIndex;
  }
  return list;
}
watch(audioList, (newList) => {
  curIndex.value = 0;
  shuffledIndex = 0;
  shuffledList = genShuffledList(newList, 0);
});

const playNextForced = () => {
  if(curIndex.value >= audioList.value.length - 1) {
    curIndex.value = 0;
  } else {
    curIndex.value++;
  }
}
const playLastForced = () => {
  if(curIndex.value <= 0) {
    curIndex.value = audioList.value.length - 1;
  } else {
    curIndex.value--;
  }
}
export const playNext = (force: boolean = false) => {
  if(force) {
    return playNextForced();
  }
  const mode = playMode.value;
  if(mode === "single") {
    return;
  }
  if(mode === "random") {
    const len = shuffledList.length;
    if(shuffledIndex >= len - 1) {
      shuffledIndex = 0;
      shuffledList = genShuffledList(audioList.value);
    } else {
      shuffledIndex++;
    }
    curIndex.value = shuffledList[shuffledIndex];
    return;
  }
  if(curIndex.value >= audioList.value.length - 1) {
    curIndex.value = 0;
    mode !== "loop" && audioPause();
  } else {
    curIndex.value++;
  }
}
export const playLast = (force: boolean = false) => {
  if(!force && playMode.value === "random") {
    shuffledIndex--;
    if(shuffledIndex < 0) {
      shuffledIndex = shuffledList.length - 1;
    }
    curIndex.value = shuffledList[shuffledIndex];
    return;
  }
  playLastForced();
}
export const playIndex = (i: number) => {
  const len = audioList.value.length;
  curIndex.value = i < 0 ? i % len + len : i % len;
}
const playModes: PlayMode[] = ["sequential", "loop", "single", "random"];
export const changePlayMode = () => {
  const i = playModes.indexOf(playMode.value);
  playMode.value = playModes[(i + 1) % playModes.length];
  if(playMode.value === "random") {
    shuffledIndex = 0;
    shuffledList = genShuffledList(audioList.value, curIndex.value);
  }
}
export const usePlayMode = () => readonly(playMode);
export const useAudioList = () => readonly(audioList);
export const useCurIndex = () => readonly(curIndex);
export const useCurAudio = () => readonly(curAudio);
export const useHttpEnd = () => readonly(httpEnd);
