<template>
  <div class="music-list">
    <div v-for="(chapter, chIdx) in chapters" :key="chIdx"
      class="chapter-list" :class="{ 'playing': isCurrentChapter(chapter) }"
    >
      <div v-if="chIdx > 0 && chapter.audioList.length" class="chapter-title">
        <p v-if="characters[chIdx - 1]">第{{ characters[chIdx - 1] }}章</p>
        <p @click="emit('change', chapter.audioList[0].index)">
          <span class="play-sym" v-if="playStatus === 'playing' && isCurrentChapter(chapter)">
            <Playing />
          </span>
          {{ chapter.title }}
          <span class="play-sym" v-if="playStatus === 'playing' && isCurrentChapter(chapter)">
            <Playing />
          </span>
        </p>
      </div>
      <div v-for="audio in chapter.audioList" :key="audio.index"
        class="music-card" :class="{ 'playing': currentIndex === audio.index }"
        @click="emit('change', audio.index)"
      >
        <div class="audio-info">
          <span class="play-sym" v-if="playStatus === 'playing' && currentIndex === audio.index">
            <Playing />
          </span>
          <span class="play-btn" title="播放">
            <svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="currentColor">
              <path d="M7,28a1,1,0,0,1-1-1V5a1,1,0,0,1,1.4819-.8763l20,11a1,1,0,0,1,0,1.7525l-20,11A1.0005,1.0005,0,0,1,7,28Z"/>
            </svg>
          </span>
          <span class="index">{{ audio.index + 1 }}</span>
          <span class="name">{{ audio.name }}</span>
          <span class="artist">{{ audio.artist }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Audio, Chapter, ChapterBorder } from '../../index';
import type { PlayStatus } from '../composables';
import { computed, toRef, onMounted, watch } from 'vue';
import Playing from './Playing.vue';

const props = defineProps<{
  audioList: Audio[],
  playStatus: PlayStatus,
  currentIndex: number,
  chapterBorders?: ChapterBorder[],
}>();

const emit = defineEmits<{
  (event: "change", index: number): void
}>();

declare const __CHAPTER_BORDERS__: ChapterBorder[];

const audioList = toRef(props, "audioList");
const borders = toRef(props, "chapterBorders", __CHAPTER_BORDERS__);
const currentIndex = toRef(props, "currentIndex");
const characters = '一二三四五六七八九十'.split('');

const chapters = computed(() => {
  const chapters: Chapter[] = [{
    title: '默认章节', start: '', end: '', audioList: []
  }];
  let curIdx = -1, chapter: Chapter | null = null;
  audioList.value.forEach((audio, index) => {
    const name = [audio.name, audio.artist].join(" - ");
    if(name === borders.value[curIdx + 1]?.start) {
      chapter = { ...borders.value[++curIdx], audioList: [] };
      chapters.push(chapter);
    }
    (chapter ?? chapters[0]).audioList.push({ ...audio, index });
    if(name === borders.value[curIdx]?.end) chapter = null;
  });
  return chapters;
});

const isCurrentChapter = (chapter: Chapter): boolean => {
  const firstIndex = chapter.audioList.at(0)?.index || -1;
  const lastIndex = chapter.audioList.at(-1)?.index || -1;
  return currentIndex.value >= firstIndex && currentIndex.value <= lastIndex;
}

onMounted(() => {
  watch(chapters, (ch) => console.log(ch));
});
</script>

<style scoped lang="postcss">
.music-list {
  padding: 0 .5rem;

  --bg-color: rgba(235 238 238 / .8);
  --bd-color: 85 85 87;
  --color: rgba(22 22 23 / .8);
  --info-color: #666;
  --chapter-color: #444;
}
.dark .music-list {
  --bg-color: rgba(40 40 42 / .8);
  --bd-color: 180 180 178;
  --color: rgba(255 255 245 / .8);
  --info-color: #666;
  --chapter-color: #888;
}

.chapter-list.playing .chapter-title p:nth-child(2) {
  color: rgb(68 182 165);
}
.chapter-title {
  margin: 1rem 0;
  text-align: center;
  font-family: 有爱圆体;
  p {
    margin: 0;
    line-height: 1.5em;

    &:nth-child(1) {
      font-size: smaller;
      color: var(--chapter-color);
    }

    &:nth-child(2) {
      font-weight: 600;
      letter-spacing: .2em;
      cursor: pointer;
    }
  }
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
