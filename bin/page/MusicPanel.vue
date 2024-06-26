<template>
  <div ref="container" class="canvas-container" v-if="!showLyric">
    <div v-if="curPlayStatus === 'pending'">稍后播放..</div>
    <div v-if="!nolyric" v-show="curPlayStatus !== 'pending'"
      class="lyric" :style="{ transition: 'all .2s ease-in-out' }">
      <Scroller class="lyric-wrap" ref="scroller"
        :data="lyric"
        :options="{ disableTouch: true }"
        @init="onInitScroller">
        <div>
          <div :class="{ active: activeLyricIndex === index }" :key="index" class="lyric-item" ref="lyric"
            v-for="(l, index) in lyricWithTranslation">
            <p :key="contentIndex" class="lyric-text" v-for="(content, contentIndex) in l.contents">{{ content }}</p>
          </div>
        </div>
      </Scroller>
    </div>
    <canvas ref="audioCanvas"
      :class="{ paused: curPlayStatus === 'paused' }"
      :style="{ transition: 'all .2s ease-in-out' }"
      @click="changeTheme">
    </canvas>
  </div>
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
  <teleport v-if="bgCanvasOn" to="#app">
    <div ref="bgCanvasContainer" class="bg-canvas">
      <canvas ref="bgCanvas" :class="{ paused: curPlayStatus === 'paused' }"/>
    </div>
  </teleport>
</template>

<script lang="ts">
import type { Audio } from '../../index';
import type { PropType } from 'vue';
import type BScroll from '@better-scroll/core';
import type { LRCObject, Theme } from './utils';
import { defineComponent } from 'vue';
import { useCurAudio, useAnalyserAudio, useCurPlayStatus } from '../composables';
import { audioTheme, lyricParser, initRender } from './utils';
import Scroller from './Scroller.vue';

declare const __VUEPRESS_SSR__: boolean;

const THEME_STORAGE_KEY = "music_panel_theme";
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
    theme: {
      type: [String, Array] as PropType<Theme | "line" | (typeof audioTheme)["apple"]>,
      default: "summer",
    },
    currentTime: {
      type: Number,
      default: 0,
    },
    totalTime: {
      type: Number,
      default: 0,
    },
    bgCanvasOn: {
      type: Boolean,
      default: false,
    }
  },
  data(ctx) {
    return {
      audio: useCurAudio(),
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
      curTheme: <Theme | "line" | "custom">(typeof ctx.theme === "string" ? ctx.theme : "custom"),
    }
  },
  mounted() {
    if(!__VUEPRESS_SSR__) {
      this.fetchLrc(this.audio);
    }
  },
  emits: {
    changeLyric(lyric: string) {
      return true;
    }
  },
  watch: {
    activeLyricIndex(newIndex, oldIndex) {
      if (newIndex !== oldIndex) {
        this.checkAndScroll();
        const content = this.lyric[newIndex]?.content;
        if(content) {
          this.$emit("changeLyric", content);
        }
      }
    },
    showLyric() {
      setTimeout(() => this.checkAndScroll(), 100);
    },
    audio(val: Audio) {
      if(!__VUEPRESS_SSR__) {
        this.fetchLrc(val);
      }
    },
  },
  computed: {
    activeLyricIndex() {
      let temp = this.lyricWithTranslation
        ? this.lyricWithTranslation.findIndex((l, index) => {
          const nextLyric = this.lyricWithTranslation[index + 1]
          return (
            this.currentTime >= l.time &&
            (nextLyric ? this.currentTime < nextLyric.time : true)
          );
        })
        : -1;
      return temp;
    },
    lyricWithTranslation() {
      let ret: Lyric[] = [];
      // 空内容的去除
      const lyricFiltered = this.lyric.filter(({ content }) => Boolean(content));
      // content统一转换数组形式
      if (lyricFiltered.length) {
        lyricFiltered.forEach(l => {
          const { time, content } = l;
          const lyricItem = { time, content, contents: [content] };
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
    // 主题色
    canvasTheme(): (typeof audioTheme)["apple"] {
      return this.curTheme === "custom"
        ? this.theme as Exclude<typeof this.theme, Theme | "line">
        : audioTheme[this.curTheme] || audioTheme["apple"];
    }
  },
  methods: {
    changeTheme() {
      const allThemes = Object.keys(audioTheme) as Theme[];
      if(this.curTheme === "custom") {
        this.curTheme = "line";
      } else if(this.curTheme === "line") {
        this.curTheme = allThemes[0];
      } else {
        const idx = allThemes.indexOf(this.curTheme);
        const len = allThemes.length;
        const hasCustom = typeof this.theme !== "string";
        this.curTheme = idx >= len - 1
          ? hasCustom ? "custom" : "line"
          : allThemes[(idx + 1) % len];
      }
    },
    fetchLrc(audio: Audio) {
      audio.lrc && fetch(audio.lrc)
        .then(res => res.text())
        .then(txt => lyricParser(txt).lyric)
        .then(lyric => this.lyric = lyric);
    },
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
    checkAndScroll() {
      if (
        !this.lyricScrolling[WHEEL_TYPE] &&
        !this.lyricScrolling[SCROLL_TYPE]
      ) {
        this.scrollToActiveLyric();
      }
    },
    scrollToActiveLyric() {
      const index = this.activeLyricIndex;
      if (index !== -1) {
        type Refs = {
          scroller: { getScroller: () => BScroll },
          lyric: HTMLDivElement,
        }
        const { scroller, lyric } = this.$refs as Refs;
        if (lyric && lyric[index]) {
          scroller
            .getScroller()
            .scrollToElement(lyric[index], 200, 0, true);
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
      const frequencyArray = new Uint8Array(bufferLength);
      const timeDomainArray = new Uint8Array(bufferLength);

      const sizeGetter = (refName: string): [number, number] => {
        let container = this.$refs[refName] as HTMLDivElement;
        if(!container) return [0, 0];
        return [container.clientWidth, container.clientHeight];
      }
      const getCanvas = (refName: string, ctnRefName: string | [number, number]): CanvasRenderingContext2D | null => {
        const canvas = this.$refs[refName] as HTMLCanvasElement | null;
        if(!canvas) return null;
        [canvas.width, canvas.height] = typeof ctnRefName == "string" ?
          sizeGetter(ctnRefName) : ctnRefName;
        return canvas.getContext("2d");
      }

      const render = initRender(bufferLength);
      const renderFrame = () => {
        requestAnimationFrame(renderFrame);
        let ctx: CanvasRenderingContext2D | null;
        // 将当前频率数据复制到传入的Uint8Array，更新频率数据
        this.analyserAudio?.getByteFrequencyData(frequencyArray);
        this.analyserAudio?.getByteTimeDomainData(timeDomainArray);
        const ren = render[this.curTheme == "line" ? "line" : "bar"](
          frequencyArray, timeDomainArray
        );
        if(ctx = getCanvas("audioCanvas", "container")) {
          const sg = () => sizeGetter("container");
          console.log(sizeGetter("container"))
          ren(ctx, this.canvasTheme, sg);
        }
        if(ctx = getCanvas("bgCanvas", "bgCanvasContainer")) {
          const sg = () => sizeGetter("bgCanvasContainer");
          ren(ctx, this.canvasTheme, sg);
        }
      }
      renderFrame();
      this.isRendering = true;
    },

  }
});
</script>

<style lang="postcss" scoped>
@import "./MusicPanel.css";
</style>
