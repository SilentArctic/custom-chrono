<script setup>
import { useModal } from 'vue-final-modal';
import domToImage from 'dom-to-image';
import map from 'lodash/map';
import Popper from 'vue3-popper';
import { useToast } from 'vue-toast-notification';
import { useCardStore } from '@/stores/card';
import * as CardTypes from '@/constants/cardTypes.constants';
import HelpModal from './HelpModal.vue';

const $toast = useToast();
const cardStore = useCardStore();

const { open: openHelp, close: closeHelp } = useModal({
   component: HelpModal,
   attrs: { onClose: () => closeHelp() },
});

const handleShare = () => {
   const { cardType, syndicate, cards } = cardStore;
   const params = { cardType, syndicate };

   cards.forEach(card => {
      Object.keys(card).forEach(key => {
         let value = typeof card[key] === 'object'
            ? map(card[key], (v, k) => `${k}:${v}`).join(',')
            : card[key];
         value = encodeURIComponent(value);

         if (params[key]) {
            params[key] += `;${value}`;
         } else {
            params[key] = value;
         }
      });
   });

   const search = new URLSearchParams(params);
   navigator.clipboard.writeText(window.location.href + '?' + search);

   $toast.success('Link copied to clipboard!');
};

const handleDownload = async (fileType, close) => {
   close();

   const downloadMethod = fileType === 'svg' ? 'toSvg'
      : fileType === 'png' && 'toPng';

   const ids = [
      'card-0',
      ...(cardStore.cardType === CardTypes.AGENT ? ['card-1'] : []),
   ];

   if (ids.length > 1) {
      ids.push('cards');
   }

   for (const id of ids) {
      const node = document.getElementById(id);
      if (!node) return;

      const index = id.split('-')[1];
      const fileName = id === 'cards'
         ? `${cardStore.cards[0].name}_${cardStore.cards[1].name}.${fileType}`
         : `${cardStore.cards[Number(index)].name}.${fileType}`;

      console.log(node);
      // const dataUrl = await domToImage[downloadMethod](node, {
      //    style: {
      //       maxWidth: '100%',
      //       width: '100%',
      //    },
      // });
      // const link = document.createElement('a');
      // link.download = fileName;
      // link.href = dataUrl;
      // link.click();
   }
};
</script>

<template>
   <div class="share">
      <button @click="handleShare">Share</button>

      <Popper arrow>
         <button>Download</button>
         <template #content="{ close }">
            <div class="download-options">
               <button @click="handleDownload('svg', close)">SVG (High Quality)</button>
               <button @click="handleDownload('png', close)">PNG (Easier Uploading)</button>
            </div>
         </template>
      </Popper>

      <button @click="openHelp">Help</button>
      <!-- <button class="star">★</button> -->
   </div>
</template>

<style lang="scss" scoped>
.share {
   background: rgba(255, 255, 255, 0.03);
   display: flex;
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
      transition: all 0.15s ease;
      &:hover { opacity: 0.6; }
   }

   .download-options {
      width: 100%;
      display: flex;
      flex-direction: column;
   }

   @media (max-width: $screen-sm) {
      width: calc(100% - 20px);
      display: grid;
      grid-template-columns: repeat(3, 1fr);

      button { width: 100%; }
   }
}
</style>
