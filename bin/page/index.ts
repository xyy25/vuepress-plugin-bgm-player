import type { Ref, InjectionKey } from 'vue';
import type { ChapterOption } from '../../index';
export { default as MusicPlayer } from "./MusicPlayer.vue";

export const BGM_CHAPTER_KEY: InjectionKey<Ref<ChapterOption[] | undefined>> = Symbol("bgmChapter");
