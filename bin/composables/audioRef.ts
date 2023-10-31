import { ref, watch } from "vue";
import { throttle } from "./throttle";

declare const __VUEPRESS_SSR__: boolean;
declare const __AUTOPLAY__: boolean;
const VOLUME_KEY = "reco-bgm-volume";
export type EventFunc = (e: Event) => void;
export type PlayStatus = "playing" | "pending" | "paused";

const audioRef = ref<HTMLAudioElement | null>(null);
const curPlayStatus = ref<PlayStatus>("paused");
const playPromise = ref<Promise<void> | null>(null);
const volume = ref(0);
const mute = ref(false);
const audioContext = ref<AudioContext | null>(null);
const analyserAudio = ref<AnalyserNode | null>(null);
const sourceAudio = ref<MediaElementAudioSourceNode | null>(null);

const canplay = ref(false);
const canplayHooks = ref<EventFunc[]>([]);
const timeupdateHooks = ref<EventFunc[]>([]);
const endedHooks = ref<EventFunc[]>([]);

if (!__VUEPRESS_SSR__) {
  let firstLoad = false;
  volume.value = Number(localStorage.getItem(VOLUME_KEY) ?? "0.5");
  const stopWatch = watch(audioRef, (audio) => {
    if (audio === null) {
      return;
    }
    // 解决ios设备上无法播放问题
    const userAgent = navigator.userAgent;
    const isIOS = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    if (isIOS) {
      audio.load();
    }
    audio.addEventListener("canplay", (e) => {
      canplay.value = true;
      canplayHooks.value.forEach((f) => f(e));
      if (firstLoad && __AUTOPLAY__) {
        tryAutoPlay();
        firstLoad = false;
      }
      if (curPlayStatus.value === 'playing') {
        // 播放状态下歌曲准备完成立即播放
        audioPlay();
      }
    });
    audio.addEventListener("ended", (e) =>
      endedHooks.value.forEach((f) => f(e))
    );
    audio.addEventListener("timeupdate", (e) =>
      timeupdateHooks.value.forEach((f) => f(e))
    );

    // @ts-ignore
    // 创建AudioContext，关联音频输入，进行解码、控制音频播放和暂停
    audioContext.value = new (window.AudioContext || window.webkitAudioContext)();
    const ctx = audioContext.value;
    // 创建analyser，获取音频的频率数据（FrequencyData）和时域数据（TimeDomainData）
    analyserAudio.value = ctx.createAnalyser();
    // fftSize：快速傅里叶变换，信号样本的窗口大小，区间为32-32768，默认2048
    analyserAudio.value.fftSize = 1024;
    // 创建音频源
    sourceAudio.value = ctx.createMediaElementSource(audio);
    // 音频源关联到分析器
    sourceAudio.value.connect(analyserAudio.value);
    // 分析器关联到输出设备（耳机、扬声器等）
    analyserAudio.value.connect(ctx.destination);

    stopWatch();
  });

  watch([volume, mute], ([vol, mte]) => {
    if (!audioRef.value) {
      return;
    }
    audioRef.value.volume = mte ? 0 : vol;
    localStorage.setItem(VOLUME_KEY, vol.toString());
  });

  const tryAutoPlay = () => {
    let tryCount = 0;

    const tryPlay = async () => {
      try {
        await audioPlay();
        console.log("bgm-player: 自动播放成功");
      } catch (e) {
        console.log("bgm-player: 自动播放失败，尝试第", ++tryCount, "次");
        // 用定时器尝试播放3次，如果3次后失败，则监听用户点击事件实现自动播放
        const handleClick = async () => {
          await audioPlay();
          window.removeEventListener("click", handleClick);
        };
        tryCount < 3
          ? setTimeout(tryPlay, 1000)
          : window.addEventListener("click", handleClick);
      }
    };
  };
}

export const audioPlay = async () => {
  if (!audioRef.value || playPromise.value) {
    return;
  }
  playPromise.value = audioRef.value.play();
  curPlayStatus.value = "pending";
  await playPromise.value;
  curPlayStatus.value = "playing";
  playPromise.value = null;
};

export const audioPause = () => {
  if (!audioRef.value || playPromise.value) {
    return;
  }
  curPlayStatus.value = "paused";
  audioRef.value.pause();
};

export const registerCanplay = (cb: EventFunc) => {
  canplayHooks.value.push(cb);
}
export const registerTimeupdate = (cb: EventFunc) => {
  timeupdateHooks.value.push(throttle(cb, 500));
}
export const registerEnded = (cb: EventFunc) => {
  endedHooks.value.push(cb);
}
export const useAudioRef = () => audioRef;
export const useCurPlayStatus = () => curPlayStatus;
export const useCanplay = () => canplay;
export const useVolume = () => volume;
export const useMute = () => mute;
export const useAnalyserAudio = () => analyserAudio;
