<script setup>
import { useModal } from 'vue-final-modal';
import * as htmlToImage from 'html-to-image';
import Popper from 'vue3-popper';
import { useToast } from 'vue-toast-notification';
import { useCardStore } from '@/stores/card.store';
import * as CardTypes from '@/constants/cardTypes.constants';
import { buildCardParams } from '@/utils/serializeState';
import ShareHelpModal from './ShareHelpModal.vue';
import FilesModal from '@/components/Files/FilesModal.vue';

const $toast = useToast();
const cardStore = useCardStore();

const { open: openHelp, close: closeHelp } = useModal({
   component: ShareHelpModal,
   attrs: { onClose: () => closeHelp() },
});

const { open: openFiles, close: closeFiles } = useModal({
   component: FilesModal,
   attrs: { onClose: () => closeFiles() },
});

const handleShare = () => {
   navigator.clipboard.writeText(window.location.href + '?' + buildCardParams(cardStore));
   $toast.success('Link copied to clipboard!');
};

const handleDownload = async (fileType, close) => {
   close();

   /* Target render width per card so PNG output is consistent and crisp
      regardless of how large the card is displayed on the user's screen. */
      const TARGET_CARD_WIDTH = 940;

   const downloadMethod =
      fileType === 'svg' ? 'toSvg' : fileType === 'png' && 'toPng';

   const ids = [
      'print-wrapper-0',
      ...(cardStore.cardType === CardTypes.AGENT ? ['print-wrapper-1'] : []),
   ];

   const cardsWrapperId = 'print-wrapper-all';
   if (ids.length > 1) {
      ids.push(cardsWrapperId);
   }

   for (const id of ids) {
      const node = document.getElementById(id);
      if (!node) return;

      const index = id.split('-')[2];
      const fileName =
         id === cardsWrapperId
            ? `${cardStore.cards[0].name}_${cardStore.cards[1].name}.${fileType}`
            : `${cardStore.cards[Number(index)].name}.${fileType}`;

      /* For the combined PNG, stitch two individually-captured cards on a
         canvas instead of capturing print-wrapper-all directly. Capturing
         both cards in a single html-to-image call introduces a thin
         rendering artifact at the boundary between them. */
      if (id === cardsWrapperId && fileType === 'png') {
         const node0 = document.getElementById('print-wrapper-0');
         const node1 = document.getElementById('print-wrapper-1');
         const pr = Math.max(window.devicePixelRatio, TARGET_CARD_WIDTH / node0.offsetWidth);
         const captureOpts = { filter: (n) => !n.classList?.contains('spacer'), pixelRatio: pr };
         const [url0, url1] = await Promise.all([
            htmlToImage.toPng(node0, captureOpts),
            htmlToImage.toPng(node1, captureOpts),
         ]);
         const loadImg = (url) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = url; });
         const [img0, img1] = await Promise.all([loadImg(url0), loadImg(url1)]);
         const gap = Math.round(16 * pr); // 1rem gap scaled to output resolution
         const canvas = document.createElement('canvas');
         canvas.width = img0.width + gap + img1.width;
         canvas.height = Math.max(img0.height, img1.height);
         const ctx = canvas.getContext('2d');
         ctx.fillStyle = '#06070b';
         ctx.fillRect(0, 0, canvas.width, canvas.height);
         ctx.drawImage(img0, 0, 0);
         ctx.drawImage(img1, img0.width + gap, 0);
         const link = document.createElement('a');
         link.download = fileName;
         link.href = canvas.toDataURL('image/png');
         link.click();
         continue;
      }

      /* Scale the capture up to TARGET_CARD_WIDTH so output quality is the
         same on small and large screens. A single card spans the full node
         width; the agent pair (print-wrapper-all) holds two side by side. */
      const cardsAcross = id === cardsWrapperId ? 2 : 1;
      const targetWidth = TARGET_CARD_WIDTH * cardsAcross;
      const pixelRatio = Math.max(
         window.devicePixelRatio,
         targetWidth / node.offsetWidth,
      );

      const dataUrl = await htmlToImage[downloadMethod](node, {
         filter: (node) => !node.classList?.contains('spacer'),
         ...(fileType === 'png' && { pixelRatio }),
      });
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
   }
};
</script>

<template>
   <div class="share">
      <button title="Share" @click="handleShare">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
            <polyline points="16 6 12 2 8 6"/>
            <line x1="12" y1="2" x2="12" y2="15"/>
         </svg>
         <span>Share</span>
      </button>

      <Popper arrow>
         <button title="Download">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
               <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
               <polyline points="7 10 12 15 17 10"/>
               <line x1="12" y1="15" x2="12" y2="3"/>
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
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
         </svg>
         <span>Files</span>
      </button>

      <button title="Help" @click="openHelp">
         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="10"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
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
