<script setup>
import { onMounted } from 'vue';
import { useShowcaseStore } from '@/stores/showcase.store';
import { useFilesStore } from '@/stores/files.store';
import { BaseInput, BaseSelect, BaseHr } from '../common';
import EditBarArtSlider from './EditBarArtSlider.vue';

const showcaseStore = useShowcaseStore();
const filesStore = useFilesStore();

onMounted(() => filesStore.load());

const handleValue = ({ target: { name, value } }) => {
   showcaseStore.setValue(name, value);
};

const handleRange = ({ target: { name, value } }) => {
   showcaseStore.setBackgroundPos(name, value);
};
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

   <BaseSelect
      name="exampleFileId"
      :value="showcaseStore.exampleFileId"
      @input="handleValue"
   >
      <option value="">Choose an example card...</option>
      <option v-for="file in filesStore.files" :key="file.id" :value="file.id">
         {{ file.name }}
      </option>
   </BaseSelect>
</template>

<style lang="scss" scoped></style>
