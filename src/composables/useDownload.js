import { computed } from 'vue';
import * as htmlToImage from 'html-to-image';
import { useToast } from 'vue-toast-notification';
import { useCardStore } from '@/stores/card.store';
import { useShowcaseStore } from '@/stores/showcase.store';
import * as CardTypes from '@/constants/creatorTypes.js';

const isCorsError = (err) => {
   const msg = err?.message ?? '';
   return (
      msg.includes('Failed to fetch') ||
      msg.includes('NetworkError') ||
      msg.includes('CORS') ||
      msg.includes('cross-origin') ||
      msg.includes('tainted')
   );
};

export function useDownload() {
   const $toast = useToast();
   const cardStore = useCardStore();
   const showcaseStore = useShowcaseStore();

   const isShowcase = computed(() =>
      CardTypes.Showcases.includes(cardStore.cardType),
   );

   const handleDownload = async (fileType, close) => {
      close();

      const downloadMethod =
         fileType === 'svg' ? 'toSvg' : fileType === 'png' && 'toPng';

      try {
         if (isShowcase.value) {
            const isCollection = cardStore.cardType === CardTypes.COLLECTION;
            const nodeId = isCollection ? 'collection-print-wrapper' : 'showcase-print-wrapper';
            const node = document.getElementById(nodeId);
            if (!node) return;
            const TARGET_WIDTH = 1920;
            const pixelRatio = Math.max(
               window.devicePixelRatio,
               TARGET_WIDTH / node.offsetWidth,
            );
            const fileName = isCollection
               ? `${showcaseStore.name || 'collection'}.${fileType}`
               : `${showcaseStore.name || 'showcase'} - ${showcaseStore.header || 'feature'}.${fileType}`;
            node.classList.add('export-flatten');
            let dataUrl;
            try {
               dataUrl = await htmlToImage[downloadMethod](node, {
                  ...(fileType === 'png' && { pixelRatio }),
               });
            } finally {
               node.classList.remove('export-flatten');
            }
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            link.click();
            return;
         }

         /* Target render width per card so PNG output is consistent and crisp
            regardless of how large the card is displayed on the user's screen. */
         const TARGET_CARD_WIDTH = 940;

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
               const pr = Math.max(
                  window.devicePixelRatio,
                  TARGET_CARD_WIDTH / node0.offsetWidth,
               );
               const captureOpts = {
                  filter: (n) => !n.classList?.contains('spacer'),
                  pixelRatio: pr,
               };
               node0.classList.add('export-flatten');
               node1.classList.add('export-flatten');
               let url0, url1;
               try {
                  [url0, url1] = await Promise.all([
                     htmlToImage.toPng(node0, captureOpts),
                     htmlToImage.toPng(node1, captureOpts),
                  ]);
               } finally {
                  node0.classList.remove('export-flatten');
                  node1.classList.remove('export-flatten');
               }
               const loadImg = (url) =>
                  new Promise((res) => {
                     const i = new Image();
                     i.onload = () => res(i);
                     i.src = url;
                  });
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

            node.classList.add('export-flatten');
            let dataUrl;
            try {
               dataUrl = await htmlToImage[downloadMethod](node, {
                  filter: (node) => !node.classList?.contains('spacer'),
                  ...(fileType === 'png' && { pixelRatio }),
               });
            } finally {
               node.classList.remove('export-flatten');
            }
            const link = document.createElement('a');
            link.download = fileName;
            link.href = dataUrl;
            link.click();
         }
      } catch (err) {
         if (isCorsError(err)) {
            $toast.error(
               'Download failed: one or more images could not be loaded due to CORS restrictions. Try hosting the image elsewhere (e.g. Imgur) and re-adding it.',
               { duration: 8000 },
            );
         } else {
            $toast.error('Download failed. Please try again.');
         }
      }
   };

   return { handleDownload };
}
