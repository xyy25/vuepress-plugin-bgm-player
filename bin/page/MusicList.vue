<template>
  <div class="music-list">
    <div v-for="(chapter, chIdx) in chapters" :key="chIdx"
        class="chapter-list" :class="{ 'playing': chapter == currentChapter }"
      >
      <div v-if="chIdx > 0 && chapter.audioList.length" class="chapter-title">
        <p v-if="characters[chIdx - 1]">第{{ characters[chIdx - 1] }}章</p>
        <p @click="onClickChapterTitle(chapter)">
          <span class="play-sym" v-if="playStatus === 'playing' && chapter == currentChapter">
            <Playing />
          </span>
          <span v-for="(char, idx) in chapter.title" :key="idx" v-text="char"
            class="title" :style="{ '--delay': `${Math.random() * 2}s` }" />
          <span class="play-sym" v-if="playStatus === 'playing' &&chapter == currentChapter">
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
          <span class="name auto-scroll">
            <div class="item" v-text="audio.name"/>
          </span>
          <span class="artist">
            <div v-text="audio.artist"/>
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Audio, Chapter, ChapterOption } from '../../index';
import { useAudioList, useCurPlayStatus, useCurIndex, usePlayMode } from '../composables';
import { computed, toRef, onMounted, watch, ref } from 'vue';
import Playing from './Playing.vue';
import { inject } from 'vue';
import { BGM_CHAPTER_KEY } from '.';

const props = defineProps<{
  chapterOptions?: ChapterOption[],
}>();

const emit = defineEmits<{
  (event: "change", index: number): void
  (event: "chapterChange", chapter: Chapter): void
}>();

declare const __CHAPTER_OPTIONS__: ChapterOption[];

const compOptions = toRef(props, "chapterOptions");
const injectOptions = inject(BGM_CHAPTER_KEY);
const options = computed<ChapterOption[]>(() => {
  return compOptions.value
    || injectOptions?.value
    || __CHAPTER_OPTIONS__;
});
const audioList = useAudioList();
const playStatus = useCurPlayStatus();
const playMode = usePlayMode();
const currentIndex = useCurIndex();
const characters = '一二三四五六七八九十'.split('');

type AudioItem = Audio & { index: number };
const chapters = computed(() => {
  const chapters: Chapter[] = [{
    title: '默认章节', audioList: []
  }];
  if(!options.value.length) {
    chapters[0].audioList = audioList.value
      .map((a, index) => ({ ...a, index }));
    return chapters;
  }
  for(const option of options.value) {
    const audioMap: Record<string, AudioItem> =
      Object.fromEntries(audioList.value.map((a, index) => [
        [a.name, a.artist].join(" - "), { ...a, index }
      ]));
    const list: AudioItem[] = [];
    if("order" in option && !option.order.length) {
      for(const audioOrder of option.order) {
        if(typeof audioOrder === "string") {
          list.push(audioMap[audioOrder]);
        } else {
          const index = audioOrder;
          list.push({ ...audioList.value[index], index });
        }
      }
    } else if("start" in option) {
      let stIdx = typeof option.start === "string"
        ? audioMap[option.start]?.index || 0
        : option.start;
      let edIdx = typeof option.end === "string"
        ? audioMap[option.end]?.index || audioList.value.length - 1
        : option.end;
      [stIdx, edIdx] = [Math.min(stIdx, edIdx), Math.max(stIdx, edIdx)];
      list.push(...audioList.value
        .map((a, index) => ({ ...a, index }))
        .slice(stIdx, edIdx + 1)
      );
    }
    chapters.push({
      ...option,
      audioList: list,
    });
  }
  return chapters;
});

const currentChapter = computed<Chapter>(() => {
  return chapters.value.find((chapter) => {
    const firstIndex = chapter.audioList.at(0)?.index ?? Infinity;
    const lastIndex = chapter.audioList.at(-1)?.index ?? -1;

    return currentIndex.value >= firstIndex && currentIndex.value <= lastIndex;
  }) ?? chapters.value[0];
});

function randInt(max: number, min: number = 0): number {
  return Math.floor(Math.random() * (max - min) + min);
}

function onClickChapterTitle(chapter: Chapter) {
  if(playMode.value === "random") {
    return emit("change", chapter.audioList[randInt(chapter.audioList.length)].index);
  }
  if(chapter != currentChapter.value) {
    emit('change', chapter.audioList[0].index);
  }
}

onMounted(() => {
  watch(chapters, (ch) => console.log(ch));
  emit("chapterChange", currentChapter.value);
  watch(currentChapter, chapter => emit("chapterChange", chapter));
});
</script>

<style scoped lang="postcss">
@import "./MusicList.css";
</style>
