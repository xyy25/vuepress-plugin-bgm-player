<template>
  <div id="music-player">
    <div class="loading" v-if="isLoading">
      <Loading />
    </div>
    <div class="left">
      <div class="chapter" :class="{ 'playing': playStatus == 'playing' }">
        <h1 :data-text="'♪ ' + currentChapter.title + ' ♪'">♪ {{ currentChapter.title }} ♪</h1>
        <div class="song-name auto-scroll">
          <div class="item">
            {{ curAudio.name + ' - ' + curAudio.artist }}
          </div>
        </div>
        <div v-text="currentChapter.description ?? ''"/>
      </div>
      <div class="board">
        <MusicBoard ref="musicBoardRef"
          :current-time="currentTime"
          :total-time="totalTime"
          @changePanel="panelIsLyric = !panelIsLyric"
          @play="play"
          @pause="pause"
          @jump="to => (currentTime = to, scrollLrc())"
          @change="to => ({ last: playLast, next: playNext }[to])()"
          @toggle-bg-canvas="bgCanvasOn = !bgCanvasOn"
        />
      </div>
      <div class="slot">
        <slot
          :audio="curAudio"
          :index="curIndex"
          :play-status="playStatus"
          :play-mode="playMode"
          :current-time="currentTime"
          :total-time="totalTime"
        />
      </div>
    </div>
    <div class="right">
      <div class="panel" :class="{ 'hide-panel': hidePanel && !panelIsLyric }">
        <MusicPanel ref="musicPanelRef"
          :show-lyric="panelIsLyric"
          :current-time="currentTime"
          :total-time="totalTime"
          :bg-canvas-on="bgCanvasOn"
        />
      </div>
      <button class="panel-hidden-btn" @click="hidePanel = !hidePanel">
        <hr />
        <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32" fill="currentColor">
          <polygon v-if="hidePanel" points="16,22 6,12 7.4,10.6 16,19.2 24.6,10.6 26,12 "/>
          <polygon v-else points="16,10 26,20 24.6,21.4 16,12.8 7.4,21.4 6,20 "/>
        </svg>
        <hr />
      </button>
      <div class="list">
        <MusicList ref="musicListRef"
          @change="playTo"
          @chapter-change="chapter => currentChapter = chapter"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { unref, defineComponent } from "vue";
import Loading from "./Loading.vue";
import MusicBoard from "./MusicBoard.vue";
import MusicPanel from "./MusicPanel.vue";
import MusicList from "./MusicList.vue";
import * as cp from "../composables";
import type { Chapter } from "../..";
// import { getSongDetail } from '../api';
// import { mapState, mapMutations, mapActions } from "../store/helper/music";

declare const __VUEPRESS_SSR__: boolean;

export default defineComponent({
  components: {
    Loading,
    MusicBoard,
    MusicPanel,
    MusicList,
  },
  data() {
    return {
      httpEnd: cp.useHttpEnd(),
      audioRef: cp.useAudioRef(),
      curAudio: cp.useCurAudio(),
      curIndex: cp.useCurIndex(),
      songReady: cp.useCanplay(),
      playStatus: cp.useCurPlayStatus(),
      playMode: cp.usePlayMode(),
      currentTime: 0,
      totalTime: 0,
      albumName: "未知歌单",
      isLoading: true,
      hidePanel: false,
      panelIsLyric: false,
      bgCanvasOn: true,
      currentChapter: <Chapter>{ title: "", audioList: [] },
    }
  },
  mounted() {
    this.isLoading = !(this.songReady && this.httpEnd);
    if(__VUEPRESS_SSR__) {
      return;
    }
    this.totalTime = this.audioRef?.duration || 0;
    const that = this;
    cp.registerListener("canplay", function() {
      that.totalTime = this.duration;
    }, "MusicPlayer");
    cp.registerListener("timeupdate", function() {
      that.currentTime = this.currentTime;
    }, "MusicPlayer");
    cp.registerListener("ended", () => this.end(), "MusicPlayer");
    this.getSong();
    if(this.songReady) {
      (this.$refs.musicPanelRef as InstanceType<typeof MusicPanel>).onLoadAudio();
    }
  },
  unmounted() {
    if(__VUEPRESS_SSR__) {
      return;
    }
    cp.unregisterListener("canplay", "MusicPlayer");
    cp.unregisterListener("timeupdate", "MusicPlayer");
    cp.unregisterListener("ended", "MusicPlayer");
  },
  watch: {
    curPlayStatus(n) {
      if(n === "playing") {
        (this.$refs.musicPanelRef as InstanceType<typeof MusicPanel>).onLoadAudio();
      }
    },
    songReady(n) {
      this.isLoading = !(n && this.httpEnd);
    },
    httpEnd(n) {
      this.isLoading = !(n && this.songReady);
    }
  },
  methods: {
    end() {
      this.getSong();
    },
    async play() {
      if (this.songReady) {
        try {
          await cp.audioPlay();
          (this.$refs.musicPanelRef as InstanceType<typeof MusicPanel>).onLoadAudio();
        } catch (err) {
          console.log(err);
          this.playStatus = "paused";
        }
      }
    },
    pause() {
      cp.audioPause();
    },
    // 播放下一首
    playNext() {
      this.currentTime = 0;
      cp.playNext(this.playMode === "single");
    },
    // 播放上一首
    playLast() {
      this.currentTime = 0;
      cp.playLast(this.playMode === "single");
    },
    playTo(index: number) {
      this.currentTime = 0;
      cp.playIndex(index);
      if(this.playStatus !== "playing") {
        this.play();
      }
    },
    scrollLrc() {
      const musicPanelRef = this.$refs.musicPanelRef as InstanceType<typeof MusicPanel>;
      setTimeout(() => musicPanelRef.checkAndScroll(), 100);
    },
    getSong() {
      const musicBoardRef = this.$refs.musicBoardRef as InstanceType<typeof MusicBoard> | null;
      musicBoardRef?.getSong();
    },
  }
});
</script>

<style lang="postcss" scoped>
@import "./MusicPlayer.css";
</style>
