<template>
  <div class="cover">
    <img class="point" src="../assets/img/point.png" alt="">
    <img :class="['bar', playing ? 'play' : '']" src="../assets/img/bar.png" alt="">
    <div class="img-outer-container">
      <div :class="['img-outer', playing ? '' : 'paused']">
        <div class="img-album">
          <img :src="albumImg" alt="">
        </div>
      </div>
    </div>
  </div>
  <div class="progress-bar-wrap">
    <div class="seq-control">
      <div class="btn clickable" @click="changePlayMode" :title="playModeText[playMode]">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
          width="17" height="17" fill="currentColor" v-html="playModeIcon[playMode]">
        </svg>
      </div>
      <div class="btn clickable" @click="emit('toggleBgCanvas')" title="背景特效开关">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
          width="17" height="17" fill="currentColor" v-html="toggleBgCanvasIcon">
        </svg>
      </div>
      <div class="btn clickable" title="音量">
        <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"
          width="17" height="17" fill="currentColor" v-html="volumeIcon"
          @click="isMute = !isMute">
        </svg>
        <div class="volume-bar" ref="volumeBarRef" @click="volumeSet">
          <div class="volume-bar-enter" :style="{ width: `${volume * 100}%` }" />
        </div>
      </div>
    </div>
    <div class="time clickable" @click="reverseTime = !reverseTime">
      {{ reverseTime
        ? `-${formatTime(totalTime - currentTime)}`
        : formatTime(currentTime)
      }} / {{ formatTime(totalTime) }}
    </div>
    <div class="progress-bar clickable" ref="progressBarRef" @click="progressJump">
      <div class="progress-bar-enter" :style="{ width: progress }"></div>
    </div>
  </div>
  <div class="control">
    <div class="btn toggle-music clickable" @click="emit('change', 'last')" title="上一首">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
        <path d="M27,28a1,1,0,0,1-.5-.13l-19-11a1,1,0,0,1,0-1.74l19-11a1,1,0,0,1,1,0A1,1,0,0,1,28,5V27a1,1,0,0,1-1,1ZM10,16l16,9.27V6.73Z" transform="translate(0 0)"/>
        <rect x="2" y="4" width="2" height="24"/>
      </svg>
    </div>
    <div :class="['btn', playing ? 'play' : 'pause']" @click="onClickSong" title="播放/暂停">
      <svg v-show="!playing" t="1640174711530" class="svg" viewBox="0 0 900 1024" version="1.1"
        xmlns="http://www.w3.org/2000/svg" p-id="801" width="20" height="20">
        <path
          d="M780.8 475.733333L285.866667 168.533333c-27.733333-17.066667-64 4.266667-64 36.266667v614.4c0 32 36.266667 53.333333 64 36.266667l492.8-307.2c29.866667-14.933333 29.866667-57.6 2.133333-72.533334z"
          p-id="802" fill="#ffffff"></path>
      </svg>
      <svg v-show="playing" t="1640174831312" class="icon" viewBox="0 0 1024 1024" version="1.1"
        xmlns="http://www.w3.org/2000/svg" p-id="1138" width="20" height="20">
        <path
          d="M349.866667 149.333333h-14.933334c-21.333333 0-36.266667 14.933333-36.266666 34.133334v654.933333c0 19.2 14.933333 34.133333 34.133333 34.133333h14.933333c19.2 0 34.133333-14.933333 34.133334-34.133333V183.466667c2.133333-19.2-12.8-34.133333-32-34.133334z m341.333333 0h-14.933333c-21.333333 0-36.266667 14.933333-36.266667 34.133334v654.933333c0 19.2 14.933333 34.133333 34.133333 34.133333h14.933334c19.2 0 34.133333-14.933333 34.133333-34.133333V183.466667c2.133333-19.2-12.8-34.133333-32-34.133334z"
          p-id="1139" fill="#ffffff"></path>
      </svg>
    </div>
    <div class="btn share" v-copy="href" title="分享">
      <svg t="1640253998462" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="2826" width="15" height="15">
        <path
          d="M512 42.666667a37.12 37.12 0 1 1 0 74.026666H227.84a111.573333 111.573333 0 0 0-111.146667 111.146667v568.32a111.573333 111.573333 0 0 0 111.146667 111.146667h568.32a111.573333 111.573333 0 0 0 111.146667-111.146667V512A37.12 37.12 0 1 1 981.333333 512v284.16A185.6 185.6 0 0 1 796.16 981.333333H227.84A185.6 185.6 0 0 1 42.666667 796.16V227.84A185.6 185.6 0 0 1 227.84 42.666667z m432.213333 0A37.12 37.12 0 0 1 981.333333 79.786667V277.333333a37.12 37.12 0 1 1-74.026666 0V169.173333L525.866667 550.613333a37.12 37.12 0 0 1-52.48 0 37.12 37.12 0 0 1 0-52.48L854.826667 116.693333H746.666667A37.12 37.12 0 1 1 746.666667 42.666667z"
          fill="#ffffff" p-id="2827"></path>
        <path
          d="M796.16 986.666667H227.84a192 192 0 0 1-190.506667-190.506667V227.84a192 192 0 0 1 190.506667-190.506667H512a42.666667 42.666667 0 1 1 0 85.333334H227.84a106.666667 106.666667 0 0 0-106.666667 106.666666v566.826667a106.666667 106.666667 0 0 0 106.666667 106.666667h568.32a106.666667 106.666667 0 0 0 106.666667-106.666667V512a42.666667 42.666667 0 1 1 85.333333 0v284.16a192 192 0 0 1-192 190.506667z m-568.32-938.666667a180.48 180.48 0 0 0-179.84 179.84v568.32a180.48 180.48 0 0 0 179.84 179.84h568.32a180.48 180.48 0 0 0 179.84-179.84V512a31.786667 31.786667 0 1 0-64 0v284.16a117.12 117.12 0 0 1-116.48 116.48H227.84a117.12 117.12 0 0 1-116.48-116.48V227.84a117.12 117.12 0 0 1 116.48-116.48H512a31.786667 31.786667 0 1 0 0-64z m271.786667 518.826667a42.666667 42.666667 0 0 1-42.666667-42.666667 42.666667 42.666667 0 0 1 12.373333-29.866667L842.026667 122.026667H746.666667a42.666667 42.666667 0 1 1 0-85.333334h197.546666a42.666667 42.666667 0 0 1 42.666667 42.666667V277.333333a42.666667 42.666667 0 1 1-85.333333 0V181.973333L529.706667 554.666667a42.666667 42.666667 0 0 1-30.08 12.16zM867.626667 111.36l-390.4 390.613333a31.36 31.36 0 0 0 0 44.8 32.426667 32.426667 0 0 0 44.8 0L912.64 156.16V277.333333a31.786667 31.786667 0 1 0 64 0V79.786667a31.786667 31.786667 0 0 0-31.786667-31.786667H746.666667a31.786667 31.786667 0 1 0 0 64z"
          fill="#ffffff" p-id="2828"></path>
      </svg>
    </div>
    <div class="btn switch" @click="emit('changePanel')" title="切换面板">
      <!-- <svg t="1640501097351" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="5847" width="20" height="20"><path d="M883.8 407.9H726.7v249.3c0 58.3-47.2 105.5-105.5 105.5h-179v86.8c0.1 40.2 32.6 72.7 72.8 72.8h368.9c40.2-0.1 72.7-32.6 72.8-72.8V480.7c0-19.3-7.6-37.9-21.3-51.5-13.7-13.7-32.3-21.3-51.6-21.3z m0 0" fill="#ffffff" p-id="5848" data-spm-anchor-id="a313x.7781069.0.i13" class="selected"></path><path d="M515 342.3h211.8V208.5c0-58.3-47.2-105.5-105.5-105.5H172.5C114.2 103 67 150.2 67 208.5v448.6c0 58.3 47.2 105.5 105.5 105.5h204.1V480.7c0.1-76.4 62-138.3 138.4-138.4z m0 0" fill="#ffffff" p-id="5849" data-spm-anchor-id="a313x.7781069.0.i14" class="selected"></path><path d="M726.7 657.2V407.9H515c-40.2 0.1-72.7 32.6-72.8 72.8v282h179c28 0 54.8-11.1 74.6-30.9 19.8-19.8 30.9-46.6 30.9-74.6z m0 0" fill="#ffffff" p-id="5850" data-spm-anchor-id="a313x.7781069.0.i15" class="selected"></path></svg> -->
      <svg t="1641741992711" class="icon" viewBox="0 0 1137 1024" version="1.1" xmlns="http://www.w3.org/2000/svg"
        p-id="57234" width="20" height="20">
        <path
          d="M775.509333 843.320889V364.032a119.751111 119.751111 0 0 0-119.808-119.751111H299.406222V119.751111C299.406222 53.646222 353.052444 0 419.157333 0h598.869334C1084.131556 0 1137.777778 53.646222 1137.777778 119.751111v603.761778a119.751111 119.751111 0 0 1-119.751111 119.808h-242.517334z"
          p-id="57235" fill="#ffffff"></path>
        <path
          d="M0 301.169778m119.751111 0l479.118222 0q119.751111 0 119.751111 119.751111l0 483.328q0 119.751111-119.751111 119.751111l-479.118222 0q-119.751111 0-119.751111-119.751111l0-483.328q0-119.751111 119.751111-119.751111Z"
          p-id="57236" fill="#ffffff"></path>
      </svg>
    </div>
    <div class="btn toggle-music clickable" @click="emit('change', 'next')" title="下一首">
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
        <path d="M5,28a1,1,0,0,1-1-1V5a1,1,0,0,1,.5-.87,1,1,0,0,1,1,0l19,11a1,1,0,0,1,0,1.74l-19,11A1,1,0,0,1,5,28ZM6,6.73V25.27L22,16Z" transform="translate(0)"/>
        <rect x="28" y="4" width="2" height="24"/>
      </svg>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { PlayMode } from "../composables";
import { ref, toRefs, computed, watch, onMounted } from "vue";
import { formatTime } from "./utils";
import defaultAlbumImg from "../assets/img/album.jpg?url";
import { useCurPlayStatus, useCurAudio, useAudioRef, usePlayMode } from "../composables";
import { useMute, useVolume, changePlayMode } from "../composables";

declare const __VUEPRESS_SSR__: boolean;

const props = defineProps<{
  currentTime: number,
  totalTime: number,
}>()

const emit = defineEmits<{
  (event: "play"): void
  (event: "pause"): void
  (event: "jump", to: number): void
  (event: "change", to: "last" | "next"): void
  (event: "changePanel"): void
  (event: "toggleBgCanvas"): void
}>();

const { currentTime, totalTime } = toRefs(props);
const audio = useAudioRef();
const curAudio = useCurAudio();
const playStatus = useCurPlayStatus();
const playMode = usePlayMode();
const isMute = useMute();
const volume = useVolume();

const volumeBarRef = ref<HTMLDivElement>();
const progressBarRef = ref<HTMLDivElement>();
const reverseTime = ref(false);
const href = ref('');
const albumImg = ref(defaultAlbumImg);

const playModeIcon: Record<PlayMode, string> = {
  sequential: '<polygon points="18 22 19.414 20.586 23 24.172 23 4 25 4 25 24.172 28.586 20.586 30 22 24 28 18 22"/><rect x="2" y="18" width="14" height="2"/><rect x="6" y="12" width="10" height="2"/><rect x="10" y="6" width="6" height="2"/>',
  single: '<path d="M6,6H26.1719l-3.586-3.5859L24,1l6,6-6,6-1.4141-1.4141L26.1719,8H6v7H4V8A2.0024,2.0024,0,0,1,6,6Z" transform="translate(0)"/><path d="M9.4141,20.4141,5.8281,24H26V17h2v7a2.0024,2.0024,0,0,1-2,2H5.8281L9.414,29.5859,8,31,2,25l6-6Z" transform="translate(0)"/><polygon points="17 19 17 11 15 11 15 12 13 12 13 14 15 14 15 19 13 19 13 21 19 21 19 19 17 19"/>',
  loop: '<path d="M6,6H26.1719l-3.586-3.5859L24,1l6,6-6,6-1.4141-1.4141L26.1719,8H6v7H4V8A2.0024,2.0024,0,0,1,6,6Z"/><path d="M9.4141,20.4141,5.8281,24H26V17h2v7a2.0024,2.0024,0,0,1-2,2H5.8281L9.414,29.5859,8,31,2,25l6-6Z"/>',
  random: '<path d="M22.59,19.41,26.17,23H19.55l-4.37-7,4.37-7h6.62l-3.58,3.59L24,14l6-6L24,2,22.59,3.41,26.17,7H19.55a2,2,0,0,0-1.69.94L14,14.11,10.14,7.94A2,2,0,0,0,8.45,7H2V9H8.45l4.37,7L8.45,23H2v2H8.45a2,2,0,0,0,1.69-.94L14,17.89l3.86,6.17a2,2,0,0,0,1.69.94h6.62l-3.58,3.59L24,30l6-6-6-6Z" transform="translate(0 0)"/>',
}
const playModeText: Record<PlayMode, string> = {
  sequential: "默认播放",
  single: "单曲循环",
  loop: "列表循环",
  random: "随机播放",
}
const toggleBgCanvasIcon = '<polygon points="5.5 23 2 30 9 30 5.5 23"/><path d="m26,15v2c1.1025,0,2,.8975,2,2v5c0,1.1025-.8975,2-2,2H10v2h16c2.2061,0,4-1.7939,4-4v-5c0-2.2056-1.7939-4-4-4Z"/><path d="m14,24c-.4463,0-.8389-.2959-.9614-.7251l-1.793-6.2749h-3.2456v-2h4c.4463,0,.8389.2959.9614.7251l1.0386,3.6348,3.0386-10.6348c.1226-.4292.5151-.7251.9614-.7251s.8389.2959.9614.7251l1.793,6.2749h3.2456v2h-4c-.4463,0-.8389-.2959-.9614-.7251l-1.0386-3.6348-3.0386,10.6348c-.1226.4292-.5151.7251-.9614.7251Z"/><path d="m4,13v-5c0-1.103.897-2,2-2h16v-2H6c-2.2056,0-4,1.7944-4,4v5c0,2.2056,1.7944,4,4,4v-2c-1.103,0-2-.897-2-2Z"/><circle cx="27" cy="5" r="3"/><g id="_Transparent_Rectangle_" data-name="&amp;lt;Transparent Rectangle&amp;gt;"><rect style="fill: none;" width="32" height="32"/></g>';

const playing = computed(() => {
  return playStatus.value === "playing";
});
const progress = computed(() => {
  return totalTime.value
    ? Math.ceil(currentTime.value / totalTime.value * 100) + '%'
    : '0%';
});
const volumeIcon = computed(() => {
  if(isMute.value) {
    return '<polygon points="31 12.41 29.59 11 26 14.59 22.41 11 21 12.41 24.59 16 21 19.59 22.41 21 26 17.41 29.59 21 31 19.59 27.41 16 31 12.41"/><path d="M18,30a1,1,0,0,1-.71-.3L9.67,22H3a1,1,0,0,1-1-1H2V11a1,1,0,0,1,1-1H9.67l7.62-7.7a1,1,0,0,1,1.41,0A1,1,0,0,1,19,3V29A1,1,0,0,1,18,30ZM4,20h6a1.17,1.17,0,0,1,.79.3L17,26.57V5.43L10.79,11.7A1.17,1.17,0,0,1,10,12H4Z"/>';
  }
  return volume.value < .5
    ? '<path d="M25.1,10.66,23.58,12a6,6,0,0,1-.18,7.94l1.47,1.36a8,8,0,0,0,.23-10.59Z"/><path d="M20,30a1,1,0,0,1-.71-.3L11.67,22H5a1,1,0,0,1-1-1H4V11a1,1,0,0,1,1-1h6.67l7.62-7.7a1,1,0,0,1,1.41,0A1,1,0,0,1,21,3V29A1,1,0,0,1,20,30ZM6,20h6a1.17,1.17,0,0,1,.79.3L19,26.57V5.43L12.79,11.7A1.17,1.17,0,0,1,12,12H6Z"/>'
    : '<path d="M27.16,8.08,25.63,9.37a10,10,0,0,1-.29,13.23L26.81,24a12,12,0,0,0,.35-15.88Z"/><path d="M21.58,12a6,6,0,0,1-.18,7.94l1.47,1.36a8,8,0,0,0,.23-10.59Z"/><path d="M18,30a1,1,0,0,1-.71-.3L9.67,22H3a1,1,0,0,1-1-1H2V11a1,1,0,0,1,1-1H9.67l7.62-7.7a1,1,0,0,1,1.41,0A1,1,0,0,1,19,3V29A1,1,0,0,1,18,30ZM4,20h6.08a1,1,0,0,1,.71.3L17,26.57V5.43L10.79,11.7a1,1,0,0,1-.71.3H4Z"/>';
});

function getSong() {
  const { cover, url } = curAudio.value;
  href.value = url;
  albumImg.value = (cover && cover.replace("250y250", "400y400")) || defaultAlbumImg;
}

function onClickSong() {
  if(playStatus.value === "paused") {
    emit("play");
  } else {
    emit("pause");
  }
}

function volumeSet(e: MouseEvent) {
  const bar = volumeBarRef.value;
  if(!bar) return;
  volume.value = e.offsetX / bar.offsetWidth;
}

function progressJump(e: MouseEvent) {
  // 歌曲未加载完成时点击进度条的错误处理
  if(!totalTime.value || !audio.value) return;
  const bar = progressBarRef.value;
  if(!bar) return;
  const percent = e.offsetX / bar.offsetWidth;
  audio.value.currentTime = percent * totalTime.value;
  emit("jump", percent * totalTime.value);
}

watch(curAudio, () => {
  getSong();
});

onMounted(() => {
  if(__VUEPRESS_SSR__) {
    return;
  }
  href.value = window.location.href;
});

defineExpose({
  getSong,
});
</script>

<style scoped lang="postcss">
@import "./MusicBoard.css";
</style>
