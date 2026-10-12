<script setup>
import { ref, computed, onMounted, watchEffect } from 'vue';
import { refDebounced } from '@vueuse/core';
import { VueFinalModal } from 'vue-final-modal';
import { useToast } from 'vue-toast-notification';
import { useCardStore } from '@/stores/card.store';
import { useChronoCardsStore } from '@/stores/chronoCards.store';
import { fetchCardDetail, toEditorState } from '@/utils/chronoCards';
import { BaseHr } from '../common';

const emit = defineEmits(['close']);

const cardStore = useCardStore();
const chronoCardsStore = useChronoCardsStore();
const $toast = useToast();

onMounted(() => chronoCardsStore.load());

const search = ref('');
const loadingCode = ref('');

const searchRef = ref(null);
watchEffect(() => {
   if (searchRef.value) searchRef.value.focus();
});

const debouncedSearch = refDebounced(search, 200);

const filterCards = (query) => {
   const term = query.trim().toLowerCase();
   if (!term) return chronoCardsStore.cards;
   return chronoCardsStore.cards.filter(
      (card) =>
         card.name.toLowerCase().includes(term) ||
         card.immortalizedName.toLowerCase().includes(term),
   );
};

const visibleCards = computed(() => filterCards(debouncedSearch.value));

const handleSelect = async (card) => {
   if (loadingCode.value) return;
   loadingCode.value = card.code;
   try {
      const detail = await fetchCardDetail(card.code);
      cardStore.setState(toEditorState(detail));
      $toast.success(`Loaded "${card.name}"`);
      emit('close');
   } catch (error) {
      console.error(error);
      $toast.error(`Could not load "${card.name}".`);
   } finally {
      loadingCode.value = '';
   }
};

// filter on the live value so Enter doesn't pick a stale debounced result
const handleEnter = () => {
   const [first] = filterCards(search.value);
   if (first) handleSelect(first);
};
</script>

<template>
   <VueFinalModal
      class="modal"
      content-class="modal-content load-card-modal-content"
      overlay-transition="vfm-fade"
      content-transition="vfm-fade"
   >
      <div class="load-card-modal">
         <div>
            <h1>Load Existing Card</h1>
            <BaseHr />
         </div>

         <input
            ref="searchRef"
            v-model="search"
            class="search"
            placeholder="Search cards..."
            autocomplete="off"
            @keyup.enter="handleEnter"
         />

         <div class="card-list">
            <p v-if="chronoCardsStore.loading" class="empty-state">
               Fetching cards...
            </p>
            <p v-else-if="chronoCardsStore.error" class="empty-state">
               {{ chronoCardsStore.error }}
               <button
                  type="button"
                  class="retry-btn"
                  @click="chronoCardsStore.load()"
               >
                  Retry
               </button>
            </p>
            <p v-else-if="!visibleCards.length" class="empty-state">
               No cards found.
            </p>

            <template v-else>
               <button
                  v-for="card in visibleCards"
                  :key="card.code"
                  type="button"
                  class="list-row"
                  :class="{ loading: loadingCode === card.code }"
                  :disabled="!!loadingCode"
                  @click="handleSelect(card)"
               >
                  <span class="row-name">
                     {{ card.name }}
                     <span v-if="card.immortalizedName" class="row-immortalized">
                        › {{ card.immortalizedName }}
                     </span>
                  </span>
                  <span class="row-meta">
                     <template v-if="loadingCode === card.code">
                        Loading...
                     </template>
                     <template v-else>
                        {{ card.syndicate }} · {{ card.type }} · {{ card.cost }}
                     </template>
                  </span>
               </button>
            </template>
         </div>
      </div>
   </VueFinalModal>
</template>

<style lang="scss">
.load-card-modal-content {
   height: auto !important;
   max-height: 70% !important;
   width: 800px !important;
   max-width: calc(100% - 20px) !important;
   padding-bottom: 1rem !important;

   @media (max-width: $screen-sm) {
      max-height: 80% !important;
   }
}
</style>

<style lang="scss" scoped>
.load-card-modal {
   min-height: 0;
   display: flex;
   flex-direction: column;
   gap: 0.6rem;

   h1 {
      font-size: 1.375rem;
      margin: 0;
   }

   .search {
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
}

.card-list {
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

   .empty-state {
      color: rgba(255, 255, 255, 0.45);
      font-size: 0.9rem;
      padding: 1.5rem 0;
      text-align: center;
   }

   .retry-btn {
      background: rgba(255, 255, 255, 0.07);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 0.4rem;
      color: white;
      padding: 0.25rem 0.75rem;
      font-size: 0.85rem;
      cursor: pointer;
      margin: 0 0 0 0.5rem;

      &:hover {
         background: rgba(255, 255, 255, 0.13);
      }
   }

   .list-row {
      width: 100%;
      flex-shrink: 0;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0;
      padding: 0.45rem 0.6rem;
      border-radius: 0.4rem;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.07);
      color: white;
      text-align: left;
      cursor: pointer;
      transition: background 0.12s ease;

      &:hover:not(:disabled),
      &.loading {
         background: rgba(255, 255, 255, 0.09);
      }

      &:disabled {
         cursor: default;

         &:not(.loading) {
            opacity: 0.5;
         }
      }

      .row-name {
         flex: 1;
         font-size: 0.9rem;
         white-space: nowrap;
         overflow: hidden;
         text-overflow: ellipsis;
      }

      .row-immortalized {
         color: rgba(255, 255, 255, 0.5);
      }

      .row-meta {
         font-size: 0.75rem;
         color: rgba(255, 255, 255, 0.4);
         white-space: nowrap;
         flex-shrink: 0;
      }
   }
}
</style>
