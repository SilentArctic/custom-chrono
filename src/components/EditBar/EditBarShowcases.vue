<script setup>
import { BaseInput, BaseHr } from '../common';
import EditBarArtSlider from './EditBarArtSlider.vue';
import FileSelect from '../Files/FileSelect.vue';
import { useShowcaseHandlers } from '@/composables/useShowcaseHandlers';

const { showcaseStore, handleValue, handleRange } = useShowcaseHandlers();
</script>

<template>
   <BaseInput
      name="header"
      placeholder="Header (e.g. New Keyword)"
      autocomplete="off"
      :value="showcaseStore.header"
      @input="handleValue"
   />

   <BaseInput
      name="name"
      placeholder="Feature Name"
      autocomplete="off"
      autocapitalize="words"
      :value="showcaseStore.name"
      @input="handleValue"
   />

   <BaseInput
      textarea
      name="description"
      placeholder="Description. Hint: [keyword], {card reference}, $timeline$, @ for chain symbol."
      rows="6"
      :value="showcaseStore.description"
      @input="handleValue"
   />

   <BaseHr />

   <BaseInput
      name="background"
      placeholder="Background Image URL"
      autocomplete="off"
      :value="showcaseStore.background"
      @input="handleValue"
   />

   <BaseInput
      name="artCredit"
      placeholder="Image Credit"
      autocomplete="off"
      :value="showcaseStore.artCredit"
      @input="handleValue"
   />

   <EditBarArtSlider
      label="x"
      :value="showcaseStore.backgroundPos.x"
      @handleRange="handleRange"
   />
   <EditBarArtSlider
      label="y"
      :value="showcaseStore.backgroundPos.y"
      @handleRange="handleRange"
   />
   <EditBarArtSlider
      label="z"
      :value="showcaseStore.backgroundPos.z"
      @handleRange="handleRange"
   />
   <EditBarArtSlider
      label="r"
      :value="showcaseStore.backgroundPos.r"
      @handleRange="handleRange"
   />

   <BaseHr />

   <FileSelect
      name="exampleFileId"
      empty-label="Choose an example card..."
      :value="showcaseStore.exampleFileId"
      @input="handleValue"
   />
</template>

<style lang="scss" scoped></style>
