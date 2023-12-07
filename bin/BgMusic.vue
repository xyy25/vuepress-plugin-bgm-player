<template>
  <div class="reco-bgm-panel">
    <!-- 播放器 -->
    <audio id="bgm" ref="bgm" crossorigin="anonymous" />
    <module-transition :position="floatPosition">
      <div v-show="isFloat" @click="toggleMode(false)" class="reco-float-box" :style="floatStyle">
        <img :class="rotate" :src="curAudio.cover ?? defaultCover">
      </div>
    </module-transition>
    <module-transition :position="align.x">
      <div ref="bgmBox" class="reco-bgm-box" v-show="!isFloat" :style="panelPos"
        @mousedown="onDragBegin">
        <!-- 封面 -->
        <div class="reco-bgm-cover" :class="rotate" @click="toggleMode(false)"
          :style="`background-image:url(${curAudio.cover ?? defaultCover})`">
          <!-- mini操作栏 -->
          <div v-if="isMini" class="mini-operation">
            <i v-if="curPlayStatus === 'playing'" @click.stop="pauseBgm" class="reco-bgm reco-bgm-pause clickable"></i>
            <i v-else @click.stop="playBgm" class="reco-bgm reco-bgm-play clickable"></i>
          </div>
          <!-- 错误信息显示 -->
          <div v-if="isFault" class="fault-message">
            播放失败
          </div>
        </div>
        <!-- <module-transition duration=".15"> -->
        <!-- 歌曲信息栏 -->
        <div v-show="!isMini" class="reco-bgm-info">
          <!-- 歌曲名 -->
          <div class="info-box">
            <i class="reco-bgm reco-bgm-music music"></i>
            {{ curAudio.name }}
          </div>
          <!-- 艺术家名 -->
          <div class="info-box">
            <i class="reco-bgm reco-bgm-artist"></i>
            {{ curAudio.artist }}
          </div>
          <!-- 歌曲进度条 -->
          <div class="reco-bgm-progress">
            <div class="progress-bar clickable bar" ref="pbar" @click="progressJump">
              <div class="bar" :style="{ width: progress }"></div>
            </div>
          </div>
          <!-- 歌曲操作栏 -->
          <div class="reco-bgm-operation">
            <i class="reco-bgm reco-bgm-last last clickable" @click="playLast"></i>
            <i v-if="curPlayStatus === 'playing'" @click="pauseBgm" class="reco-bgm reco-bgm-pause pause clickable"></i>
            <i v-else ref="play" @click="playBgm" class="reco-bgm reco-bgm-play play clickable"></i>
            <i class="reco-bgm reco-bgm-next next clickable" @click="playNext"></i>
            <i v-if="isMute" @click="unMuteBgm" class="reco-bgm reco-bgm-mute mute clickable"></i>
            <i v-else @click="muteBgm" class="reco-bgm reco-bgm-volume1 volume clickable"></i>
            <div class="volume-bar clickable bar" ref="vbar" @click="volumeJump">
              <div class="bar" :style="{ width: `${volume * 100}%` }" ></div>
            </div>
          </div>
        </div>
        <!-- </module-transition> -->
        <!-- 收起按钮 -->
        <!-- <module-transition duration=".15"> -->
        <div v-if="!isMini" @click="toggleMode(true)" class="reco-bgm-left-box">
          <i class="reco-bgm" :class="`reco-bgm-${align.x}`"></i>
        </div>
        <!-- </module-transition> -->
      </div>
    </module-transition>
  </div>
</template>

<script>
import ModuleTransition from './ModuleTransition.vue';
import * as cp from "./composables";

export default {
  components: {
    ModuleTransition,
  },
  data() {
    return {
      curIndex: cp.useCurIndex(),
      curPlayStatus: cp.useCurPlayStatus(),
      curAudio: cp.useCurAudio(),
      audioRef: cp.useAudioRef(),
      audiolist: cp.useAudioList(),
      volume: cp.useVolume(),
      isMute: cp.useMute(),
      playMode: cp.usePlayMode(),
      currentTime: 0,
      totalTime: 0,
      /** @type {string} */
      defaultCover: __DEFAULT_COVER__,
      /** @type {import("../index").PositionOptions} */
      panelPosition: __INIT_POSITION__,
      /** @type {boolean} */
      draggable: __DRAGGABLE__,
      isFloat: false,
      isMini: false,
      firstLoad: true,
      isFault: false,
      /** @type {"left" | "right"} */
      floatPosition: __FLOAT_POSITION__,
      /** @type {import("vue").StyleValue} */
      floatStyle: __FLOAT_STYLE__,
      /** @type {boolean} */
      autoShrink: __AUTO_SHRINK__,
      /** @type {"mini" | "float"} */
      shrinkMode: __SHRINK_MODE__,
      initPos: true,
      dragging: false,
      align: { x: "left", y: "bottom" }, // 记录播放器的对齐状态
      oMouse: null,
      orgX: 0,
      orgY: 0,
      posX: 0,
      posY: 0
    }
  },
  created() {
    const { right, top } = this.panelPosition;
    right && (this.align.x = "right");
    top && (this.align.y = "top");
  },
  computed: {
    rotate() {
      return this.curPlayStatus === "playing" ? "rotate" : ""
    },
    panelPos() {
      const { x: alignX, y: alignY } = this.align;
      return this.initPos ? this.panelPosition : {
        left: alignX === "left" ? `${this.posX}px` : null,
        right: alignX === "right" ? `${this.posX}px` : null,
        top: alignY === "top" ? `${this.posY}px` : null,
        bottom: alignY === "bottom" ? `${this.posY}px` : null,
        "z-index": this.panelPosition["z-index"]
      }
    },
    // 更新歌曲进度条
    progress() {
      return this.totalTime
        ? Math.ceil(this.currentTime / this.totalTime * 100) + '%'
        : '0%';
    }
  },
  mounted() {
    this.audioRef = this.$refs.bgm;
    if (this.floatPosition === 'left') {
      this.floatStyle = {
        ...this.floatStyle,
        'left': '0',
        'border-top-right-radius': '20px',
        'border-bottom-right-radius': '20px'
      }
    } else {
      this.floatStyle = {
        ...this.floatStyle,
        'right': '0',
        'border-top-left-radius': '20px',
        'border-bottom-left-radius': '20px'
      }
    }
    const that = this;
    cp.registerCanplay(function() {
      that.totalTime = this.duration;
    })
    cp.registerTimeupdate(function() {
      that.currentTime = this.currentTime;
    });
    cp.registerEnded(() => this.bgmEnded());

    this.isMini = this.isMobile();
    // autoShrink为true时隐藏歌曲信息
    if (this.autoShrink) this.toggleMode(true);

    let { left, right, top, bottom } = this.$refs.bgmBox.style;
    [left, right, top, bottom] = [left, right, top, bottom]
      .map(e => e ? parseInt(e.match(/\d+/)[0]) : 0);
    this.posX = this.align.x === "left" ? left : right;
    this.posY = this.align.y === "top" ? top : bottom;
    this.initPos = false;

    if(!__VUEPRESS_SSR__) {
      document.addEventListener("bgmplay", this.playBgm);
      document.addEventListener("bgmpause", this.pauseBgm);
    }
  },
  unmounted() {
    if(!__VUEPRESS_SSR__) {
      document.removeEventListener("bgmplay", this.playBgm);
      document.removeEventListener("bgmpause", this.pauseBgm);
    }
  },
  methods: {
    /** @param { MouseEvent } oe */
    onDragBegin(oe) {
      if(!this.draggable) return;
      [this.orgX, this.orgY] = [this.posX, this.posY];
      this.oMouse = oe;
      document.addEventListener('mousemove', this.onDragAround);
      document.addEventListener('mouseup', this.onDragEnd);
    },
    /** @param { MouseEvent } e */
    onDragAround(e) {
      const { innerWidth: winW, innerHeight: winH } = window;
      const { offsetWidth: objW, offsetHeight: objH } = this.$refs.bgmBox;
      const { min, max } = Math;
      this.dragging = true;
      let dx = e.clientX - this.oMouse.clientX;
      let dy = e.clientY - this.oMouse.clientY;
      this.align.x === "right" && (dx = -dx);
      this.align.y === "bottom" && (dy = -dy);
      this.posX = max(0, min(this.orgX + dx, winW - objW));
      this.posY = max(0, min(this.orgY + dy, winH - objH));
    },
    onDragEnd() {
      this.dragging = false;
      document.removeEventListener('mousemove', this.onDragAround);
      document.removeEventListener('mouseup', this.onDragEnd);
    },
    isMobile() {
      return !!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    },
    // 显示或隐藏歌曲信息
    toggleMode(bool) {
      const isMobile = this.isMobile();
      if (isMobile || this.shrinkMode === 'float') {
        this.isFloat = bool;
      } else if (!isMobile && this.shrinkMode === 'mini') {
        this.isMini = bool;
      }
    },
    // 暂停
    pauseBgm() {
      cp.audioPause();
    },
    // 播放
    async playBgm() {
      try {
        await cp.audioPlay();
        if (this.isFault) {
          this.isFault = false;
        }
        // eslint-disable-next-line handle-callback-err
      } catch (err) {
        console.log(err);
        // 播放异常时显示播放失败并暂停播放
        this.isFault = true;
        this.pauseBgm();
      }
    },
    // 播放下一首
    playNext() {
      this.currentTime = 0;
      this.isFault = false;
      cp.playNext(this.playMode === "single");
    },
    // 播放上一首
    playLast() {
      this.currentTime = 0;
      this.isFault = false;
      cp.playLast(this.playMode === "single");
    },
    // bgm结束时自动下一首
    bgmEnded() {
      this.currentTime = 0;
      this.isFault = false;
      cp.playNext();
    },
    // 点击进度条跳播
    progressJump(e) {
      // 歌曲未加载完成时点击进度条的错误处理
      if (!this.totalTime) return;
      const percent = e.offsetX / this.$refs.pbar.offsetWidth;
      this.audioRef.currentTime = this.totalTime * percent;
      this.currentTime = this.totalTime * percent;
    },
    // 点击音量条修改音量
    volumeJump(e) {
      const percent = e.offsetX / this.$refs.vbar.offsetWidth;
      if (percent >= 0 && percent <= 1) {
        this.isMute = !(percent > 0);
        this.volume = percent;
      }
    },
    // 静音
    muteBgm() {
      this.isMute = true;
    },
    // 取消静音
    unMuteBgm() {
      this.isMute = false;
    }
  }
}
</script>

<style lang="stylus" scoped>
@require './assets/iconfont/iconfont.css'
@import './styles/index.styl'

.rotate
  animation rotation 20s infinite linear

@keyframes rotation
  0%
    rotate 0deg
  100%
    rotate 360deg

.clickable:hover
  scale 1.2
  filter drop-shadow(0 0 0.2em white) drop-shadow(0 0 0.2em white)
.clickable:active
  scale 0.9

.clickable.bar:hover
  scale none

</style>
