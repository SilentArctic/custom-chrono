<script setup>
import { onMounted, computed } from 'vue';
import { useFilesStore } from '@/stores/files.store';
import { BaseSelect } from '../common';

defineProps({
   emptyLabel: {
      type: String,
      default: 'Choose a card...',
   },
});

const filesStore = useFilesStore();

onMounted(() => filesStore.load());

const filesByFolder = computed(() => {
   const groups = [];
   for (const folder of filesStore.folders) {
      const files = filesStore.files
         .filter((f) => f.folderId === folder.id)
         .sort((a, b) => a.name.localeCompare(b.name));
      if (files.length) groups.push({ folder, files });
   }
   const unfoldered = filesStore.files
      .filter((f) => !f.folderId)
      .sort((a, b) => a.name.localeCompare(b.name));
   if (unfoldered.length) groups.push({ folder: null, files: unfoldered });
   return groups;
});
</script>

<template>
   <BaseSelect v-bind="$attrs">
      <option value="">{{ emptyLabel }}</option>
      <option value="_blank_">Blank space</option>
      <template
         v-for="group in filesByFolder"
         :key="group.folder?.id ?? 'unfoldered'"
      >
         <option disabled>
            {{ group.folder ? `— ${group.folder.name} —` : '— No Folder —' }}
         </option>
         <option v-for="file in group.files" :key="file.id" :value="file.id">
            {{ file.name }}
         </option>
      </template>
   </BaseSelect>
</template>
