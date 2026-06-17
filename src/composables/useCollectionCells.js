import { computed } from 'vue';
import { useShowcaseStore } from '@/stores/showcase.store';
import { useFilesStore } from '@/stores/files.store';
import { parseCardParams } from '@/utils/serializeState';
import * as CardTypes from '@/constants/creatorTypes';

/* Shared cell-weight logic for collection slots so the editor and the preview
   agree on the cap. A card occupies 1 cell; an agent occupies 2. An empty slot
   counts as 1 since it reserves a position still to be filled. */
export function useCollectionCells() {
   const showcaseStore = useShowcaseStore();
   const filesStore = useFilesStore();

   const cellWeight = (id) => {
      if (!id) return 1;
      const file = filesStore.files.find((f) => f.id === id);
      if (!file) return 1;
      const state = parseCardParams(new URLSearchParams(file.params));
      return state.cardType === CardTypes.AGENT ? 2 : 1;
   };

   const totalCells = computed(() =>
      /* prettier-ignore */
      showcaseStore.collectionFileIds.reduce((sum, id) => sum + cellWeight(id), 0),
   );

   const canAddSlot = computed(
      () => totalCells.value < CardTypes.COLLECTION_SLOTS_MAX,
   );

   /* Whether selecting `id` into `index` keeps the collection within the cap. */
   const fitsSelection = (index, id) => {
      const current = showcaseStore.collectionFileIds[index];
      const next = totalCells.value - cellWeight(current) + cellWeight(id);
      return next <= CardTypes.COLLECTION_SLOTS_MAX;
   };

   return { cellWeight, totalCells, canAddSlot, fitsSelection };
}
