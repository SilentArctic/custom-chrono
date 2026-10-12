import { defineStore } from 'pinia';
import { fetchCardList } from '@/utils/chronoCards';

let _loadPromise = null;

export const useChronoCardsStore = defineStore('chronoCards', {
   state: () => ({ cards: [], loaded: false, loading: false, error: '' }),
   actions: {
      async load() {
         if (this.loaded) return;
         if (_loadPromise) return _loadPromise;
         this.loading = true;
         this.error = '';
         _loadPromise = (async () => {
            try {
               this.cards = await fetchCardList();
               this.loaded = true;
            } catch (error) {
               console.error(error);
               this.error = 'Could not load the card list.';
            } finally {
               this.loading = false;
               /* a failed load can be retried */
               _loadPromise = null;
            }
         })();
         return _loadPromise;
      },
   },
});
