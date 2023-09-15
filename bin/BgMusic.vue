<template>
  <div class="reco-bgm-panel">
    <!-- 播放器 -->
    <audio id="bgm" :src="audiolist[curIndex].url" ref="bgm" @ended="bgmEnded" @canplay="playReady"
      @timeupdate="timeUpdate"></audio>
    <module-transition :position="floatPosition">
      <div v-show="isFloat" @click="changeBgmInfo(false)" class="reco-float-box" :style="floatStyle">
        <img :class="rotate" :src="audiolist[curIndex].cover ?? defaultCover">
      </div>
    </module-transition>
    <module-transition :position="align.x">
      <div ref="bgmBox" class="reco-bgm-box" v-show="!isFloat" :style="panelPos"
        @mousedown="onDragBegin">
        <!-- 封面 -->
        <div class="reco-bgm-cover" :class="rotate" @click="changeBgmInfo(false)"
          :style="`background-image:url(${audiolist[curIndex].cover ?? defaultCover})`">
          <!-- mini操作栏 -->
          <div v-if="isMini" class="mini-operation">
            <i v-if="curPlayStatus === 'playing'" @click.stop="pauseBgm" class="reco-bgm reco-bgm-pause clickable"></i>
            <i v-else-if="curPlayStatus === 'paused'" @click.stop="playBgm" class="reco-bgm reco-bgm-play clickable"></i>
          </div>
          <!-- 错误信息显示 -->
          <div v-if="isFault" class="falut-message">
            播放失败
          </div>
        </div>
        <!-- <module-transition duration=".15"> -->
        <!-- 歌曲信息栏 -->
        <div v-show="!isMini" class="reco-bgm-info">
          <!-- 歌曲名 -->
          <div class="info-box">
            <i class="reco-bgm reco-bgm-music music"></i>
            {{ audiolist[curIndex].name }}
          </div>
          <!-- 艺术家名 -->
          <div class="info-box">
            <i class="reco-bgm reco-bgm-artist"></i>
            {{ audiolist[curIndex].artist }}
          </div>
          <!-- 歌曲进度条 -->
          <div class="reco-bgm-progress">
            <div class="progress-bar clickable bar" @click="progressJump">
              <div class="bar" ref="pbar"></div>
            </div>
          </div>
          <!-- 歌曲操作栏 -->
          <div class="reco-bgm-operation">
            <i class="reco-bgm reco-bgm-last last clickable" @click="playLast"></i>
            <i v-if="curPlayStatus === 'playing'" @click="pauseBgm" class="reco-bgm reco-bgm-pause pause clickable"></i>
            <i v-else-if="curPlayStatus === 'paused'" ref="play" @click="playBgm" class="reco-bgm reco-bgm-play play clickable"></i>
            <i class="reco-bgm reco-bgm-next next clickable" @click="playNext"></i>
            <i v-if="isMute" @click="unMuteBgm" class="reco-bgm reco-bgm-mute mute clickable"></i>
            <i v-else @click="muteBgm" class="reco-bgm reco-bgm-volume1 volume clickable"></i>
            <div class="volume-bar clickable bar" @click="volumeJump">
              <div class="bar" ref="vbar"></div>
            </div>
          </div>
        </div>
        <!-- </module-transition> -->
        <!-- 收起按钮 -->
        <!-- <module-transition duration=".15"> -->
        <div v-if="!isMini" @click="changeBgmInfo(true)" class="reco-bgm-left-box">
          <i class="reco-bgm" :class="`reco-bgm-${align.x}`"></i>
        </div>
        <!-- </module-transition> -->
      </div>
    </module-transition>
  </div>
</template>

<script>
import volume from './mixins/volume.js';
import ModuleTransition from './ModuleTransition.vue';

/**
 * @param { import("../index").RequiredAudio[] } requiredAudio
 * @return { import("../index").Audio[] }
 */
function resolveAudios(requiredAudio) {
  let files = null;
  let covers = null;

  return requiredAudio.map((e) => {
    if (!("type" in e)) {
      return e;
    }
    // 获取静态目录下相应目录的音乐(由于glob无法使用变量，所以只能手动填写相对路径了)
    if (!files) files = import.meta.glob('../../../public/music/**/*.mp3', { eager: true });
    if (!covers) covers = import.meta.glob('../../../public/music/**/*.png', { eager: true });

    return Object.keys(files).map(m => {
      const reg = new RegExp(`.*public(${e.url}(.+?)( - (.+))?\\.mp3)`);
      const match = m.match(reg);
      const coverUrl = m.replace(".mp3", ".png");

      return {
        name: match[2] ?? '未知歌曲',
        artist: match[4] ?? '未知歌手',
        url: match[1],
        cover: coverUrl in covers ? coverUrl : DEFAULT_COVER
      }
    });
  }).flat();
}

export default {
  mixins: [volume],
  components: {
    ModuleTransition,
  },
  data() {
    return {
      defaultCover: DEFAULT_COVER,
      panelPosition: POSITION,
      curIndex: 0,
      curPlayStatus: 'paused',
      audiolist: [],
      autoplay: AUTOPLAY,
      draggable: true,
      isFloat: false,
      isMini: false,
      firstLoad: true,
      isMute: false,
      isFault: false,
      floatPosition: FLOAT_POSITION,
      floatStyle: FLOAT_STYLE,
      autoShrink: AUTO_SHRINK,
      shrinkMode: SHRINK_MODE,

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
    this.audiolist = resolveAudios(AUDIOS);
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
        zIndex: this.panelPosition.zIndex
      }
    }
  },
  mounted() {
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

    // autoShrink为true时隐藏歌曲信息
    if (this.autoShrink) this.changeBgmInfo(true);

    let { left, right, top, bottom } = this.$refs.bgmBox.style;
    [left, right, top, bottom] = [left, right, top, bottom]
      .map(e => e ? parseInt(e.match(/\d+/)[0]) : 0);
    this.posX = this.align.x === "left" ? left : right;
    this.posY = this.align.y === "top" ? top : bottom;
    this.initPos = false;
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

    // 显示或隐藏歌曲信息
    changeBgmInfo(bool) {
      const isMobile = !!/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
      if (isMobile || this.shrinkMode === 'float') {
        this.isFloat = bool
      } else if (!isMobile && this.shrinkMode === 'mini') {
        this.isMini = bool
      }
    },
    // audio canplay回调事件
    playReady() {
      // 第一次加载时初始化音量条并处理自动播放事件
      if (this.firstLoad) {
        if (this.getVolume()) {
          const percent = this.getVolume()
          this.$refs.vbar.style.width = percent * 100 + '%'
          this.$refs.bgm.volume = percent
        } else {
          const vbar_width = this.$refs.bgm.volume * 100 + '%'
          this.$refs.vbar.style.width = vbar_width
        }
        this.firstLoad = false
        // 自动播放的处理
        if (this.autoplay) {
          this.tryAutoPlay();
        }
      }
      // 播放状态下歌曲准备完成立即播放
      if (this.curPlayStatus === 'playing') {
        this.playBgm()
      }
    },
    tryAutoPlay() {
      let tryCount = 0;
      const playPromise = this.$refs.bgm.play()
      if(!playPromise) return;
      const tryPlay = async () => {
        try {
          await playPromise;
          console.log('bgm-player: 自动播放成功');
          this.curPlayStatus = 'playing';
        } catch (e) {
          console.log('bgm-player: 自动播放失败，尝试第', ++tryCount, '次');
          // 用定时器尝试播放3次，如果3次后失败，则监听用户点击事件实现自动播放
          const handleClick = () => {
            this.playBgm();
            window.removeEventListener('click', handleClick);
          }
          tryCount < 3 ? setTimeout(tryPlay, 1000)
            : window.addEventListener("click", handleClick);
        }
      }
      tryPlay();
    },
    // 暂停
    pauseBgm() {
      this.$refs.bgm.pause()
      this.curPlayStatus = 'paused'
    },
    // 播放
    playBgm() {
      const playPromise = this.$refs.bgm.play()
      if (playPromise !== undefined) {
        playPromise.then(res => {
          if (this.isFault) {
            this.isFault = false
          }
          this.curPlayStatus = 'playing'
          // eslint-disable-next-line handle-callback-err
        }).catch(err => {
          console.log(err)
          // 播放异常时显示播放失败并暂停播放
          this.isFault = true
          this.pauseBgm()
        })
      }
    },
    // 播放下一首
    playNext() {
      this.$refs.pbar.style.width = 0
      this.isFault = false
      if (this.curIndex >= this.audiolist.length - 1) {
        this.curIndex = 0
      } else {
        this.curIndex++
      }
    },
    // 播放上一首
    playLast() {
      this.$refs.pbar.style.width = 0
      this.isFault = false
      if (this.curIndex <= 0) {
        this.curIndex = this.audiolist.length - 1
      } else {
        this.curIndex--
      }
    },
    // bgm结束时自动下一首
    bgmEnded() {
      this.$refs.pbar.style.width = 0
      this.playNext()
    },
    // 更新歌曲进度条
    timeUpdate() {
      const total_time = this.$refs.bgm.duration
      const cur_time = this.$refs.bgm.currentTime
      const bar_width = cur_time / total_time * 100 + '%'
      this.$refs.pbar.style.width = bar_width
    },
    // 点击进度条跳播
    progressJump(e) {
      const total_time = this.$refs.bgm.duration
      const percent = e.offsetX / 150
      // 歌曲未加载完成时点击进度条的错误处理
      if (isNaN(total_time)) return
      this.$refs.bgm.currentTime = percent * total_time
    },
    // 点击音量条修改音量
    volumeJump(e) {
      const percent = e.offsetX / 57
      if (percent >= 0 && percent <= 1) {
        this.isMute = !(percent > 0)
        this.$refs.vbar.style.width = percent * 100 + '%'
        this.$refs.bgm.volume = percent
        this.setVolume(this.$refs.bgm.volume)
      }
    },
    // 静音
    muteBgm() {
      this.isMute = true
      this.setVolume(this.$refs.bgm.volume)
      this.$refs.vbar.style.width = 0
      this.$refs.bgm.volume = 0
    },
    // 取消静音
    unMuteBgm() {
      this.isMute = false
      if (this.getVolume()) {
        const percent = this.getVolume()
        this.$refs.vbar.style.width = percent * 100 + '%'
        this.$refs.bgm.volume = percent
      } else {
        this.$refs.vbar.style.width = '100%'
        this.$refs.bgm.volume = 1
      }
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
