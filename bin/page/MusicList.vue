<template>
  <div class="music-list">
    <div v-for="audio in audioList" :key="audio.url">
      <div class="audio-info">{{ audio.name }} - {{ audio.artist }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Audio } from '../../index';

const props = defineProps<{
  audioList: Audio[]
}>();

const emit = defineEmits<{
  (event: "change", index: number): void
}>();
</script>

<style lang="postcss">

</style>
