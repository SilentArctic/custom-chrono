<script setup>
import { ref, computed, onMounted } from 'vue';
import { VueFinalModal } from 'vue-final-modal';
import { useToast } from 'vue-toast-notification';
import { useCardStore } from '@/stores/card.store';
import { useFilesStore } from '@/stores/files.store';
import { buildCardParams } from '@/utils/serializeState';
import { BaseHr } from '../common';

const emit = defineEmits(['close']);

const cardStore = useCardStore();
const filesStore = useFilesStore();
const $toast = useToast();

onMounted(() => filesStore.load());

const currentFolderId = ref(null);
const showFolderInput = ref(false);
const newFolderName = ref('');
const showFileInput = ref(false);
const newFileName = ref('');

const isAtRoot = computed(() => currentFolderId.value === null);
const currentFolder = computed(() => filesStore.folders.find((f) => f.id === currentFolderId.value) ?? null);
const visibleFiles = computed(() => filesStore.files.filter((f) => f.folderId === currentFolderId.value));
const rootFiles = computed(() => filesStore.files.filter((f) => f.folderId === null));

const enterFolder = (id) => {
   currentFolderId.value = id;
   showFolderInput.value = false;
   showFileInput.value = false;
};

const goToRoot = () => {
   currentFolderId.value = null;
   showFolderInput.value = false;
   showFileInput.value = false;
};

const toggleFolderInput = () => {
   showFolderInput.value = !showFolderInput.value;
   showFileInput.value = false;
   newFolderName.value = '';
};

const toggleFileInput = () => {
   showFileInput.value = !showFileInput.value;
   showFolderInput.value = false;
   newFileName.value = showFileInput.value ? (cardStore.cards[0].name || '') : '';
};

const handleCreateFolder = async () => {
   const name = newFolderName.value.trim();
   if (!name) return;
   await filesStore.createFolder(name);
   newFolderName.value = '';
   showFolderInput.value = false;
};

const handleSaveFile = async () => {
   const name = newFileName.value.trim();
   if (!name) return;
   await filesStore.saveFile(name, buildCardParams(cardStore), currentFolderId.value);
   newFileName.value = '';
   showFileInput.value = false;
   $toast.success('File saved!');
};

const handleNew = () => {
   cardStore.reset();
   emit('close');
};

const handleLoadFile = (file) => {
   cardStore.setFromParams(new URLSearchParams(file.params));
   $toast.success(`Loaded "${file.name}"`);
   emit('close');
};

const handleDeleteFolder = async (folder) => {
   if (!confirm(`Delete folder "${folder.name}" and all its files?`)) return;
   await filesStore.deleteFolder(folder.id);
};

const handleDeleteFile = async (file) => {
   if (!confirm(`Delete "${file.name}"?`)) return;
   await filesStore.deleteFile(file.id);
};

const formatDate = (ts) =>
   new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

const isEmpty = computed(() =>
   isAtRoot.value
      ? filesStore.folders.length === 0 && rootFiles.value.length === 0
      : visibleFiles.value.length === 0,
);
</script>

<template>
   <VueFinalModal
      class="modal"
      content-class="modal-content files-modal-content"
      overlay-transition="vfm-fade"
      content-transition="vfm-fade"
   >
      <div class="files-modal">
         <div class="files-header">
            <h1>Files</h1>
            <BaseHr />
         </div>

         <nav class="breadcrumb">
            <span
               class="breadcrumb-item"
               :class="{ active: isAtRoot }"
               @click="goToRoot"
            >All Files</span>
            <template v-if="!isAtRoot">
               <span class="breadcrumb-sep">›</span>
               <span class="breadcrumb-item active">{{ currentFolder?.name }}</span>
            </template>
         </nav>

         <div class="files-actions">
            <button
               v-if="isAtRoot"
               class="action-btn"
               @click="toggleFolderInput"
            >+ Create Folder</button>
            <button
               class="action-btn"
               @click="toggleFileInput"
            >+ Save File</button>
            <button
               class="action-btn new-btn"
               @click="handleNew"
            >+ New</button>
         </div>

         <div v-if="showFolderInput" class="inline-input-row">
            <input
               v-model="newFolderName"
               placeholder="Folder name..."
               autofocus
               @keyup.enter="handleCreateFolder"
               @keyup.esc="showFolderInput = false"
            />
            <button @click="handleCreateFolder">Save</button>
            <button @click="showFolderInput = false">Cancel</button>
         </div>

         <div v-if="showFileInput" class="inline-input-row">
            <input
               v-model="newFileName"
               placeholder="File name..."
               autofocus
               @keyup.enter="handleSaveFile"
               @keyup.esc="showFileInput = false"
            />
            <button @click="handleSaveFile">Save</button>
            <button @click="showFileInput = false">Cancel</button>
         </div>

         <div class="files-list">
            <p v-if="isEmpty" class="empty-state">
               <template v-if="isAtRoot">No saved files yet. Hit "+ Save File" to save your current card.</template>
               <template v-else>This folder is empty.</template>
            </p>

            <template v-if="isAtRoot">
               <div
                  v-for="folder in filesStore.folders"
                  :key="folder.id"
                  class="list-row folder-row"
               >
                  <span class="row-icon">📁</span>
                  <span class="row-name" @click="enterFolder(folder.id)">{{ folder.name }}</span>
                  <span class="row-meta">{{ filesStore.files.filter((f) => f.folderId === folder.id).length }} files</span>
                  <button class="delete-btn" @click="handleDeleteFolder(folder)">✕</button>
               </div>

               <div
                  v-for="file in rootFiles"
                  :key="file.id"
                  class="list-row file-row"
               >
                  <span class="row-icon">🗒</span>
                  <span class="row-name" @click="handleLoadFile(file)">{{ file.name }}</span>
                  <span class="row-meta">{{ formatDate(file.savedAt) }}</span>
                  <button class="delete-btn" @click="handleDeleteFile(file)">✕</button>
               </div>
            </template>

            <template v-else>
               <div
                  v-for="file in visibleFiles"
                  :key="file.id"
                  class="list-row file-row"
               >
                  <span class="row-icon">🗒</span>
                  <span class="row-name" @click="handleLoadFile(file)">{{ file.name }}</span>
                  <span class="row-meta">{{ formatDate(file.savedAt) }}</span>
                  <button class="delete-btn" @click="handleDeleteFile(file)">✕</button>
               </div>
            </template>
         </div>
      </div>
   </VueFinalModal>
</template>

<style lang="scss">
.files-modal-content {
   height: auto !important;
   max-height: 70% !important;
   width: 600px !important;
   max-width: calc(100% - 20px) !important;
   padding-bottom: 1rem !important;

   @media (max-width: $screen-sm) {
      max-height: 80% !important;
   }
}
</style>

<style lang="scss" scoped>
.files-modal {
   display: flex;
   flex-direction: column;
   gap: 0.6rem;

   h1 {
      font-size: 1.375rem;
      margin: 0;
   }
}

.breadcrumb {
   display: flex;
   align-items: center;
   gap: 0.4rem;
   font-size: 0.85rem;
   color: rgba(255, 255, 255, 0.55);

   .breadcrumb-item {
      cursor: pointer;

      &.active {
         color: white;
         cursor: default;
      }

      &:not(.active):hover {
         color: rgba(255, 255, 255, 0.85);
      }
   }

   .breadcrumb-sep {
      color: rgba(255, 255, 255, 0.35);
   }
}

.files-actions {
   display: flex;
   gap: 0.5rem;

   .new-btn {
      margin-left: auto;
   }

   .action-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0.4rem;
      color: white;
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
      cursor: pointer;
      margin: 0;
      transition: background 0.15s ease;

      &:hover {
         background: rgba(255, 255, 255, 0.13);
         opacity: 1;
      }
   }
}

.inline-input-row {
   display: flex;
   gap: 0.5rem;
   align-items: center;

   input {
      flex: 1;
      background: rgba(0, 0, 0, 0.25);
      border: none;
      border-bottom: 4px solid rgba(255, 255, 255, 0.15);
      border-radius: 3px 3px 0 0;
      color: white;
      padding: 0.3rem 0.5rem;
      font-size: 0.9rem;
      height: 34px;
      font-family: inherit;

      &:focus {
         outline: none;
         border-bottom-color: rgba(255, 255, 255, 0.4);
      }
   }

   button {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0.4rem;
      color: white;
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
      cursor: pointer;
      margin: 0;
      transition: background 0.15s ease;

      &:hover {
         background: rgba(255, 255, 255, 0.13);
         opacity: 1;
      }
   }
}

.files-list {
   display: flex;
   flex-direction: column;
   gap: 0.35rem;
   overflow-y: auto;
   max-height: 400px;
   padding-right: 2px;

   &::-webkit-scrollbar {
      width: 19px;
   }

   &::-webkit-scrollbar-track {
      background: transparent;
   }

   &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border: 6px solid transparent;
      border-radius: 10px;
      background-clip: padding-box;
   }
}

.empty-state {
   color: rgba(255, 255, 255, 0.45);
   font-size: 0.9rem;
   padding: 1.5rem 0;
   text-align: center;
}

.list-row {
   display: flex;
   align-items: center;
   gap: 0.5rem;
   padding: 0.45rem 0.6rem;
   border-radius: 0.4rem;
   background: rgba(255, 255, 255, 0.04);
   border: 1px solid rgba(255, 255, 255, 0.07);
   transition: background 0.12s ease;

   &:hover {
      background: rgba(255, 255, 255, 0.09);
   }

   .row-icon {
      font-size: 1rem;
      flex-shrink: 0;
   }

   .row-name {
      flex: 1;
      cursor: pointer;
      font-size: 0.9rem;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      &:hover {
         text-decoration: underline;
      }
   }

   .row-meta {
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.4);
      white-space: nowrap;
      flex-shrink: 0;
   }

   .delete-btn {
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.3);
      cursor: pointer;
      font-size: 0.8rem;
      padding: 0 0.2rem;
      flex-shrink: 0;
      margin: 0;
      transition: color 0.12s ease;

      &:hover {
         color: #e06060;
         opacity: 1;
      }
   }
}

.folder-row .row-name {
   font-weight: 500;
}
</style>
