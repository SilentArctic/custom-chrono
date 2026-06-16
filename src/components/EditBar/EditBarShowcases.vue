<script setup>
import { onMounted, computed } from 'vue';
import { useShowcaseStore } from '@/stores/showcase.store';
import { useFilesStore } from '@/stores/files.store';
import { BaseInput, BaseSelect, BaseHr } from '../common';
import EditBarArtSlider from './EditBarArtSlider.vue';

const showcaseStore = useShowcaseStore();
const filesStore = useFilesStore();

onMounted(() => filesStore.load());

const filesByFolder = computed(() => {
   const groups = [];
   for (const folder of filesStore.folders) {
      const files = filesStore.files.filter((f) => f.folderId === folder.id).sort((a, b) => a.name.localeCompare(b.name));
      if (files.length) groups.push({ folder, files });
   }
   const unfoldered = filesStore.files.filter((f) => !f.folderId).sort((a, b) => a.name.localeCompare(b.name));
   if (unfoldered.length) groups.push({ folder: null, files: unfoldered });
   return groups;
});

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
      <template v-for="group in filesByFolder" :key="group.folder?.id ?? 'unfoldered'">
         <option disabled>{{ group.folder ? `— ${group.folder.name} —` : '— No Folder —' }}</option>
         <option v-for="file in group.files" :key="file.id" :value="file.id">
            {{ file.name }}
         </option>
      </template>
   </BaseSelect>
</template>

<style lang="scss" scoped></style>
