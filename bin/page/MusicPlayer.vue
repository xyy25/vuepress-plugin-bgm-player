<template>
  <div class="music-player">
    <div class="loading" v-if="isLoading">
      <Loading />
    </div>
    <div class="left">
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
        <div class="btn toggle-music clickable" @click="playLast" title="上一首">
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
        <div class="btn switch" @click="panelIsLyric = !panelIsLyric" title="切换面板">
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
        <div class="btn toggle-music clickable" @click="playNext" title="下一首">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="20" height="20" fill="currentColor">
            <path d="M5,28a1,1,0,0,1-1-1V5a1,1,0,0,1,.5-.87,1,1,0,0,1,1,0l19,11a1,1,0,0,1,0,1.74l-19,11A1,1,0,0,1,5,28ZM6,6.73V25.27L22,16Z" transform="translate(0)"/>
            <rect x="28" y="4" width="2" height="24"/>
          </svg>
        </div>
      </div>
    </div>
    <div class="right">
      <div class="panel">
        <MusicPanel ref="musicPanelRef"
          :show-lyric="panelIsLyric"
          :audio="curAudio"
          :current-time="currentTime"
          :total-time="totalTime"
        />
      </div>
      <hr />
      <div class="list">
        <MusicList
          :audio-list="audiolist"
          :current-index="curIndex"
          :play-status="curPlayStatus"
          @change="playTo"
        />
      </div>
    </div>
    <!-- <audio id="bgm"
      :src="musicSrc"
      ref="audio"
      @canplay="ready"
      @ended="end"
      @timeupdate="updateTime"
      crossorigin="anonymous"
    /> -->
  </div>
</template>

<script>
import Scroller from "./Scroller.vue";
import Loading from "./Loading.vue";
import { formatTime } from "./utils";
import albumImg from "../assets/img/album.jpg?url";
import * as comp from "../composables";
import MusicPanel from "./MusicPanel.vue";
import MusicList from "./MusicList.vue";
// import { getSongDetail } from '../api';
// import { mapState, mapMutations, mapActions } from "../store/helper/music";

export default {
  components: {
    Scroller,
    Loading,
    MusicPanel,
    MusicList,
},
  data() {
    return {
      audio: comp.useAudioRef(),
      audiolist: comp.useAudioList(),
      curAudio: comp.useCurAudio(),
      curIndex: comp.useCurIndex(),
      curPlayStatus: comp.useCurPlayStatus(),
      httpEnd: comp.useHttpEnd(),
      songReady: comp.useCanplay(),
      formatTime,
      currentTime: 0,
      totalTime: 0,
      isLoading: true,
      reverseTime: false,
      href: '',
      albumImg,
      panelIsLyric: false,
    }
  },
  mounted() {
    this.isLoading = !(this.songReady && this.httpEnd);
    if(__VUEPRESS_SSR__) {
      return;
    }
    comp.registerTimeupdate((e) => {
      this.currentTime = e.target.currentTime;
      this.totalTime = e.target.duration;
    });
    comp.registerEnded((e) => this.end(e));
    this.href = window.location.href;
    this.getSong();
    if(this.songReady) {
      this.$refs.musicPanelRef.onLoadAudio();
    }
  },
  watch: {
    curAudio() {
      this.getSong();
    },
    curPlayStatus(n) {
      if(n === "playing" && !this.isRendering) {
        this.$refs.musicPanelRef.onLoadAudio();
      }
    },
    songReady(n) {
      this.isLoading = !(n && this.httpEnd);
    },
    httpEnd(n) {
      this.isLoading = !(n && this.songReady);
    }
  },
  computed: {
    playing() {
      return this.curPlayStatus === "playing";
    },
    progress() {
      return this.totalTime
        ? Math.ceil(this.currentTime / this.totalTime * 100) + '%'
        : '0%';
    }
  },
  methods: {
    end() {
      this.getSong();
    },
    async play() {
      if (this.songReady) {
        try {
          await comp.audioPlay();
          this.$refs.musicPanelRef.onLoadAudio();
        } catch (err) {
          console.log(err);
          this.curPlayStatus = "paused";
        }
      }
    },
    pause() {
      comp.audioPause();
    },
    // 播放下一首
    playNext() {
      this.currentTime = 0;
      comp.playNext();
    },
    // 播放上一首
    playLast() {
      this.currentTime = 0;
      comp.playLast();
    },
    playTo(index) {
      this.currentTime = 0;
      comp.playIndex(index);
      if(this.curPlayStatus !== "playing") {
        this.play();
      }
    },
    /** @param {Event} e */
    progressJump(e) {
      // 歌曲未加载完成时点击进度条的错误处理
      if(!this.totalTime) return;
      const bar = this.$refs.progressBarRef;
      const percent = e.offsetX / bar.offsetWidth;
      this.audio.currentTime = percent * this.totalTime;
      this.currentTime = percent * this.totalTime;
    },
    onClickSong() {
      if(this.curPlayStatus === "paused") {
        this.play();
      } else {
        this.pause();
      }
    },
    getSong() {
      const { name, cover, artist, lrc, url } = this.curAudio;
      this.title = name;
      this.signer = artist;
      this.albumImg = cover && cover.replace("250y250", "400y400") || "";
      this.albumName = "歌单名" || "";
      this.href = url;
    },
  }
}
</script>

<style lang="postcss" scoped>
@import "./MusicPlayer.css";
</style>
