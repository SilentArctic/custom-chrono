<script setup>
import { useModal } from 'vue-final-modal';
import Popper from 'vue3-popper';
import { useToast } from 'vue-toast-notification';
import { useCardStore } from '@/stores/card.store';
import { useShowcaseStore } from '@/stores/showcase.store';
import { buildParams } from '@/utils/serializeState';
import { useDownload } from '@/composables/useDownload';
import ShareHelpModal from './ShareHelpModal.vue';
import FilesModal from '@/components/Files/FilesModal.vue';

const $toast = useToast();
const cardStore = useCardStore();
const showcaseStore = useShowcaseStore();
const { handleDownload } = useDownload();

const { open: openHelp, close: closeHelp } = useModal({
   component: ShareHelpModal,
   attrs: { onClose: () => closeHelp() },
});

const { open: openFiles, close: closeFiles } = useModal({
   component: FilesModal,
   attrs: { onClose: () => closeFiles() },
});

const handleShare = () => {
   navigator.clipboard.writeText(
      window.location.href + '?' + buildParams(cardStore, showcaseStore),
   );
   $toast.success('Link copied to clipboard!');
};

</script>

<template>
   <div class="share">
      <button title="Share" @click="handleShare">
         <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
         >
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
            <polyline points="16 6 12 2 8 6" />
            <line x1="12" y1="2" x2="12" y2="15" />
         </svg>
         <span>Share</span>
      </button>

      <Popper arrow>
         <button title="Download">
            <svg
               width="18"
               height="18"
               viewBox="0 0 24 24"
               fill="none"
               stroke="currentColor"
               stroke-width="2"
               stroke-linecap="round"
               stroke-linejoin="round"
               aria-hidden="true"
            >
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
               <polyline points="7 10 12 15 17 10" />
               <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            <span>Download</span>
         </button>
         <template #content="{ close }">
            <div class="download-options">
               <button @click="handleDownload('svg', close)">
                  SVG (High Quality)
               </button>
               <button @click="handleDownload('png', close)">
                  PNG (Easier Uploading)
               </button>
            </div>
         </template>
      </Popper>

      <button title="Files" @click="openFiles">
         <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
         >
            <path
               d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
            />
         </svg>
         <span>Files</span>
      </button>

      <button title="Help" @click="openHelp">
         <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
         >
            <circle cx="12" cy="12" r="10" />
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
         </svg>
         <span>Help</span>
      </button>
   </div>
</template>

<style lang="scss" scoped>
.share {
   background: rgba(255, 255, 255, 0.03);
   display: flex;
   gap: 1rem;
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 10px;
   padding: 10px;
   position: absolute;
   top: 10px;
   right: 10px;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
   font-size: 0.9rem;
   z-index: 2;

   button {
      background: transparent;
      border: none;
      border-radius: 3px;
      color: white;
      padding: 5px 7px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.15s ease;
      &:hover {
         opacity: 0.6;
      }

      svg {
         display: block;
      }

      span {
         margin-left: 0.5rem;
         @media (max-width: $screen-sm) {
            display: none;
         }
      }
   }

   .download-options {
      width: 100%;
      display: flex;
      flex-direction: column;
   }

   @media (max-width: $screen-sm) {
      width: calc(100% - 20px);
      display: grid;
      grid-template-columns: repeat(4, 1fr);

      button {
         width: 100%;
      }
   }
}
</style>
