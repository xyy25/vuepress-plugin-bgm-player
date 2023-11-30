<template>
  <div class="music-list">
    <div v-for="(audio, i) in audioList" :key="audio.url"
      class="music-card" :class="{ 'playing': currentIndex === i }"
      @click="emit('change', i)"
    >
      <div class="audio-info">
        <span class="play-sym" v-if="playStatus === 'playing' && currentIndex === i">
          <Playing />
        </span>
        <span class="play-btn" title="播放">
          <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
            <path d="M7,28a1,1,0,0,1-1-1V5a1,1,0,0,1,1.4819-.8763l20,11a1,1,0,0,1,0,1.7525l-20,11A1.0005,1.0005,0,0,1,7,28Z"/>
          </svg>
        </span>
        <span class="index">{{ i + 1 }}</span>
        <span class="name">{{ audio.name }}</span>
        <span class="artist">{{ audio.artist }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Audio } from '../../index';
import type { PlayStatus } from '../composables';
import Playing from './Playing.vue';

const props = defineProps<{
  audioList: Audio[],
  playStatus: PlayStatus,
  currentIndex: number,
}>();

const emit = defineEmits<{
  (event: "change", index: number): void
}>();
</script>

<style scoped lang="postcss">
.music-list {
  padding: 0 .5rem;

  --bg-color: rgba(235 238 238 / .8);
  --bd-color: 85 85 87;
  --color: rgba(22 22 23 / .8);
  --info-color: #666;
}
.dark .music-list {
  --bg-color: rgba(40 40 42 / .8);
  --bd-color: 180 180 178;
  --color: rgba(255 255 245 / .8);
  --info-color: #666;
}

.audio-info {
  font-family: 有爱圆体, sans-serif;

  .play-btn {
    margin-right: .25rem;
    .icon {
      transition: all .08s ease-in-out;
      width: 0px;
      height: 0px;
    }
  }
  .index {
    margin: 0 .8rem 0 .1rem;
    color: var(--info-color);
  }
  .name {
    color: var(--color);
  }
  .artist {
    position: absolute;
    right: 1.25rem;
    float: right;
    font-size: .8rem;
    color: var(--info-color);
  }
}

.music-card {
  --bd-opacity: 0;
  margin-bottom: .75rem;
  padding: .5rem;
  background-color: var(--bg-color);
  border-radius: .5rem;
  border-width: .125rem;
  border-color: rgba(var(--bd-color) / var(--bd-opacity));
  cursor: pointer;

  &.playing {
    --bd-opacity: .75;
    --bd-color: 68 182 165;
  }

  &:hover {
    transition: all .1s ease-in;
    --bd-opacity: 1;
    &:not(.playing) .play-btn {
      display: inline-block;

      .icon {
        width: 15px;
        height: 15px;
      }
    }
  }
}
</style>
