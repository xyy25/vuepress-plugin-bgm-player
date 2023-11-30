<template>
  <canvas ref="audioCanvas" v-if="!showLyric"
    :class="{ paused: curPlayStatus !== 'playing' }"
    :style="{ transition: 'all .2s ease-in-out' }">
  </canvas>
  <div class="lyric-container" v-else :style="{ transition: 'all .2s ease-in-out' }">
    <div class="music-name">
      <p>{{ audio.name }}</p>
      <p>歌手：{{ audio.artist }}&emsp;&emsp;专辑：{{ "专辑名称" }}</p>
    </div>
    <p v-if="nolyric" class="noLyric">还没有歌词哦~</p>
    <Scroller :data="lyric" :options="{ disableTouch: true }" @init="onInitScroller" class="lyric-wrap" ref="scroller"
      v-else>
      <div>
        <div :class="{ active: activeLyricIndex === index }" :key="index" class="lyric-item" ref="lyric"
          v-for="(l, index) in lyricWithTranslation">
          <p :key="contentIndex" class="lyric-text" v-for="(content, contentIndex) in l.contents">{{ content }}</p>
        </div>
      </div>
    </Scroller>
  </div>
</template>

<script lang="ts">
import type { Audio } from '../../index';
import type { PropType } from 'vue';
import type BScroll from '@better-scroll/core';
import { defineComponent } from 'vue';
import { useAnalyserAudio, useCurPlayStatus } from '../composables';
import { type LRCObject, audioTheme, lyricParser } from './utils';
import Scroller from './Scroller.vue';

declare const __VUEPRESS_SSR__: boolean;

const WHEEL_TYPE = "wheel";
const SCROLL_TYPE = "scroll";
type ScrollType = typeof SCROLL_TYPE | typeof WHEEL_TYPE;
// 恢复自动滚动的定时器时间
const AUTO_SCROLL_RECOVER_TIME = 1000;

interface Lyric {
  time: number
  content: string
  contents: string[]
}

export default defineComponent({
  components: {
    Scroller,
  },
  props: {
    showLyric: {
      type: Boolean,
      default: false,
    },
    audio: {
      type: Object as PropType<Audio>,
      required: true,
    },
    theme: {
      type: [String, Array] as PropType<string | Exclude<typeof audioTheme, string>[0]>,
      default: "apple",
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    totalTime: {
      type: Number,
      default: 0,
    },
  },
  data() {
    return {
      isRendering: false,
      lyric: <LRCObject[]>[],
      nolyric: false,
      lyricScrolling: <Record<ScrollType, boolean>>{
        [WHEEL_TYPE]: false,
        [SCROLL_TYPE]: false
      },
      lyricTimer: <Record<ScrollType, NodeJS.Timeout | null>>{
        [WHEEL_TYPE]: null,
        [SCROLL_TYPE]: null
      },
      analyserAudio: useAnalyserAudio(),
      curPlayStatus: useCurPlayStatus(),
    }
  },
  watch: {
    activeLyricIndex(newIndex, oldIndex) {
      if (
        newIndex !== oldIndex &&
        !this.lyricScrolling[WHEEL_TYPE] &&
        !this.lyricScrolling[SCROLL_TYPE]
      ) {
        this.scrollToActiveLyric();
      }
    },
    audio(val: Audio) {
      if(!__VUEPRESS_SSR__ && val.lrc) {
        fetch(val.lrc)
          .then(res => res.text())
          .then(txt => lyricParser(txt).lyric)
          .then(lyric => this.lyric = lyric);
      }
    }
  },
  computed: {
    activeLyricIndex() {
      let temp = this.lyricWithTranslation
        ? this.lyricWithTranslation.findIndex((l, index) => {
          const nextLyric = this.lyricWithTranslation[index + 1]
          return (
            this.currentTime >= l.time &&
            (nextLyric ? this.currentTime < nextLyric.time : true)
          )
        })
        : -1
      return temp;
    },
    lyricWithTranslation() {
      let ret: Lyric[] = [];
      // 空内容的去除
      const lyricFiltered = this.lyric.filter(({ content }) => Boolean(content));
      // content统一转换数组形式
      if (lyricFiltered.length) {
        lyricFiltered.forEach(l => {
          const { time, content } = l
          const lyricItem = { time, content, contents: [content] }
          ret.push(lyricItem);
        })
      } else {
        ret = lyricFiltered.map(({ time, content }) => ({
          time,
          content,
          contents: [content]
        }));
      }
      return ret;
    },
  },
  methods: {
    onInitScroller(scoller: BScroll) {
      const onScrollStart = (type: ScrollType) => {
        this.clearTimer(type);
        this.lyricScrolling[type] = true;
      }
      const onScrollEnd = (type: ScrollType) => {
        // 滚动结束后两秒 歌词开始自动滚动
        this.clearTimer(type);
        this.lyricTimer[type] = setTimeout(() => {
          this.lyricScrolling[type] = false;
        }, AUTO_SCROLL_RECOVER_TIME);
      }
      scoller.on("scrollStart", onScrollStart.bind(null, SCROLL_TYPE));
      scoller.on("scrollEnd", onScrollEnd.bind(null, SCROLL_TYPE));
    },
    scrollToActiveLyric() {
      if (this.activeLyricIndex !== -1) {
        type Refs = {
          scroller: { getScroller: () => BScroll },
          lyric: HTMLDivElement,
        }
        const { scroller, lyric } = this.$refs as Refs;
        if (lyric && lyric[this.activeLyricIndex]) {
          scroller
            .getScroller()
            .scrollToElement(lyric[this.activeLyricIndex], 200, 0, true);
        }
      }
    },
    clearTimer(type: ScrollType) {
      const scrollTypeTimer = this.lyricTimer[type];
      scrollTypeTimer && clearTimeout(scrollTypeTimer);
    },
    // getActiveCls(index) {
    //   return this.activeLyricIndex === index ? "active" : ""
    // },
    onLoadAudio() {
      if(!this.analyserAudio) {
        return;
      }
      // 获取频率数组
      const bufferLength = this.analyserAudio.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const renderFrame = () => {
        requestAnimationFrame(renderFrame);
        const canvas = this.$refs.audioCanvas as HTMLCanvasElement | null;
        if(!canvas) return;

        [canvas.width, canvas.height] = [435, 250];
        const ctx = canvas.getContext("2d");
        const [WIDTH, HEIGHT] = [canvas.width, canvas.height];

        const barWidth = WIDTH / bufferLength;
        let barHeight: number;
        // 主题色
        let canvasTheme: Exclude<typeof audioTheme, string>[0];
        if (typeof this.theme === "string") {
          canvasTheme = audioTheme[this.theme]
        } else {
          canvasTheme = this.theme;
        }

        // 将当前频率数据复制到传入的Uint8Array，更新频率数据
        this.analyserAudio?.getByteFrequencyData(dataArray);
        if(!ctx) {
          return;
        }
        ctx.clearRect(0, 0, WIDTH, HEIGHT);
        // bufferLength表示柱形图中矩形的个数，当前是128个
        for (let i = 0, x = 0; i < bufferLength; i++) {
          barHeight = dataArray[i];
          const gradient = ctx.createLinearGradient(0, 0, 0, 250);
          this.colorPick(gradient, canvasTheme);
          ctx.fillStyle = gradient;
          ctx.fillRect(x, 250 - barHeight, barWidth, barHeight);
          x += barWidth + 2;
        }
      }
      renderFrame();
      this.isRendering = true;
    },
    colorPick(gradient: CanvasGradient, arr: { pos: number, color: string }[]) {
      arr.forEach(item => {
        const { pos, color } = item;
        gradient.addColorStop(pos, color);
      })
    }
  }
});
</script>

<style lang="postcss" scoped>
@import "./MusicPanel.css";
</style>
