import { ref, watch } from "vue";

declare const __VUEPRESS_SSR__: boolean;

const audioRef = ref<HTMLAudioElement | null>(null);
const curTime = ref(0);
const totalTime = ref(0);

const stopWatch = watch(audioRef, (newVal) => {
  if(newVal !== null) {
    if(!__VUEPRESS_SSR__) {
      // 解决ios设备上无法播放问题
      const userAgent = navigator.userAgent;
      const isIOS = !!userAgent.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
      if (isIOS) {
        newVal.load();
      }
    }
    newVal.addEventListener('timeupdate', () => {
      curTime.value = newVal.currentTime;
      totalTime.value = newVal.duration;
    });

    stopWatch();
  } else {
    curTime.value = 0;
    totalTime.value = 0;
  }
});

watch(curTime, (newVal) => {
  if(audioRef.value) {
    audioRef.value.currentTime = newVal;
  }
});

export const useAudioRef = () => audioRef;
export const useCurTime = () => curTime;
export const useTotalTime = () => totalTime;
