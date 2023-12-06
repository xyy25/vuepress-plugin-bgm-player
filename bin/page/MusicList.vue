<template>
  <div class="music-list">
    <div v-for="(chapter, chIdx) in chapters" :key="chIdx"
        class="chapter-list" :class="{ 'playing': isCurrentChapter(chapter) }"
      >
      <div v-if="chIdx > 0 && chapter.audioList.length" class="chapter-title">
        <p v-if="characters[chIdx - 1]">第{{ characters[chIdx - 1] }}章</p>
        <p @click="!isCurrentChapter(chapter) && emit('change', chapter.audioList[0].index)">
          <span class="play-sym" v-if="playStatus === 'playing' && isCurrentChapter(chapter)">
            <Playing />
          </span>
          <span v-for="(char, idx) in chapter.title" :key="idx" v-text="char"
            class="title" :style="{ '--delay': `${Math.random() * 2}s` }" />
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
import { useAudioList, useCurPlayStatus, useCurIndex } from '../composables';
import { computed, toRef, onMounted, watch } from 'vue';
import Playing from './Playing.vue';

const props = defineProps<{
  chapterBorders?: ChapterBorder[],
}>();

const emit = defineEmits<{
  (event: "change", index: number): void
}>();

declare const __CHAPTER_BORDERS__: ChapterBorder[];

const borders = toRef(props, "chapterBorders", __CHAPTER_BORDERS__);
const audioList = useAudioList();
const playStatus = useCurPlayStatus();
const currentIndex = useCurIndex();
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
  const firstIndex = chapter.audioList.at(0)?.index ?? Infinity;
  const lastIndex = chapter.audioList.at(-1)?.index ?? -1;
  return currentIndex.value >= firstIndex && currentIndex.value <= lastIndex;
}

onMounted(() => {
  watch(chapters, (ch) => console.log(ch));
});
</script>

<style scoped lang="postcss">
@import "./MusicList.css";
</style>
