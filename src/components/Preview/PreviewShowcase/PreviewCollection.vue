<script setup>
import { computed, onMounted } from 'vue';
import { useShowcaseStore } from '@/stores/showcase.store';
import { useFilesStore } from '@/stores/files.store';
import { parseCardParams } from '@/utils/serializeState';
import { transformDescription } from '@/utils';
import * as CardTypes from '@/constants/creatorTypes';
import { useBackgroundStyle } from '@/composables/useBackgroundStyle';
import PreviewCard from '../PreviewCards/PreviewCard.vue';
import PreviewCredits from '../PreviewCredits.vue';

const showcaseStore = useShowcaseStore();
const filesStore = useFilesStore();

onMounted(() => filesStore.load());

/* Map every slot to an entry, keeping blank slots as { empty: true } so a
   deliberately-blank selection reserves an empty space in the centered row. */
const collectionEntries = computed(() =>
   showcaseStore.collectionFileIds.map((id, i) => {
      const position = showcaseStore.collectionPositions[i] ?? '';

      if (id === '_blank_') return { empty: true, position };

      const file = id && filesStore.files.find((f) => f.id === id);
      if (!file) return { position };

      const state = parseCardParams(new URLSearchParams(file.params));
      const isAgent = state.cardType === CardTypes.AGENT;

      return {
         cards: isAgent ? state.cards.slice(0, 2) : [state.cards[0]],
         cardType: state.cardType,
         syndicate: state.syndicate,
         rarity: state.rarity,
         isAgent,
         position,
      };
   }),
);

const hasAnyCard = computed(() =>
   collectionEntries.value.some((e) => !e.empty),
);

const transformedDescription = computed(() =>
   transformDescription(showcaseStore.description),
);

const backgroundStyle = useBackgroundStyle();
</script>

<template>
   <div class="collection">
      <div id="collection-print-wrapper" class="print-wrapper">
         <img
            v-if="showcaseStore.background"
            class="bg-image"
            :src="showcaseStore.background"
            :style="backgroundStyle"
            alt=""
         />

         <div class="title-bar">
            <span v-if="showcaseStore.name" class="collection-name">{{
               showcaseStore.name
            }}</span>
         </div>

         <div class="cards-area">
            <div v-if="hasAnyCard" class="cards-row">
               <div
                  v-for="(entry, i) in collectionEntries"
                  :key="i"
                  class="card-entry"
                  :class="{
                     agent: entry.isAgent,
                     up: entry.position === 'up',
                     down: entry.position === 'down',
                  }"
               >
                  <div v-if="entry.empty" class="card-slot empty-slot" />
                  <div
                     v-for="(card, j) in entry.cards"
                     :key="j"
                     class="card-slot"
                  >
                     <PreviewCard
                        v-bind="card"
                        :cardType="entry.cardType"
                        :syndicate="entry.syndicate"
                        :rarity="entry.rarity"
                     />
                  </div>
               </div>
            </div>
            <p v-else class="empty">Select cards from your saved files.</p>
         </div>

         <div class="description-bar">
            <div
               v-if="showcaseStore.description"
               class="description"
               v-html="transformedDescription"
            />
         </div>

         <PreviewCredits
            :art-credit="showcaseStore.artCredit"
            style="--credits-font-size: 1cqw"
         />
      </div>
   </div>
</template>

<style lang="scss" scoped>
.collection {
   height: 100%;
   flex: 3.75;
   display: flex;
   align-items: center;
   justify-content: center;
   padding-left: 10px;
   overflow: hidden;
   font-family: 'Barlow Condensed', sans-serif;

   @media (max-width: $screen-sm) {
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      padding: 100px 0 0;
      overflow-y: auto;
   }

   .print-wrapper {
      width: 100%;
      aspect-ratio: 16 / 9;
      container-type: inline-size;
      display: flex;
      flex-direction: column;
      border: $glass-border;
      border-radius: 10px;
      overflow: hidden;
      position: relative;

      .bg-image {
         filter: $glass-blur;
         position: absolute;
         inset: 0;
         width: 100%;
         height: 100%;
         object-fit: cover;
         object-position: center;
         z-index: 0;
         transform-origin: center;
      }

      /* Title and description bars always reserve their space (fixed height)
         so the cards-area between them is a stable, bounded region. */
      .title-bar {
         flex: 0 0 7cqw;
         background: linear-gradient(
            to bottom,
            rgba(12, 12, 16, 0.75) 0%,
            transparent 100%
         );
         display: flex;
         align-items: center;
         justify-content: center;
         padding: 1.2cqw 2cqw;
         position: relative;
         z-index: 1;
         text-shadow: 0 0 8px rgba(0, 0, 0, 0.85);

         .collection-name {
            font-size: 3cqw;
            font-weight: 700;
            color: $gold;
            line-height: 1.05;
            text-align: center;
         }
      }

      .description-bar {
         flex: 0 0 5cqw;
         background: linear-gradient(
            to top,
            rgba(12, 12, 16, 0.85) 0%,
            transparent 100%
         );
         display: flex;
         align-items: center;
         justify-content: center;
         padding: 1.2cqw 4cqw 2cqw;
         position: relative;
         z-index: 1;
         text-shadow: 0 0 8px rgba(0, 0, 0, 0.85);

         .description {
            font-size: 1.4cqw;
            line-height: 1.4;
            color: rgba(255, 255, 255, 0.92);
            text-align: center;
            white-space: pre-line;
            overflow: hidden;
            max-height: 100%;
            font-style: italic;
         }
      }

      /* size container so cards can be sized from BOTH the area's width (cqw)
         and height (cqh) — the smaller wins, so two rows never overflow. */
      .cards-area {
         min-height: 0;
         position: relative;
         z-index: 1;
         flex: 1;
         container-type: size;
         display: flex;
         align-items: center;
         justify-content: center;
         padding: 0 2rem;

         /* Single centered row of up to 5 cells (agent = 2). Flex (not grid)
            keeps the cards centered for any quantity and leaves room for future
            custom arrangements (arc, alternate groupings). */
         .cards-row {
            --g-between: 1.5cqw; /* gap between separate entries */
            --g-agent: 0.6cqw; /* tighter gap between an agent's two cards */
            display: flex;
            justify-content: center;
            align-items: center;
            gap: var(--g-between);
            width: 100%;
            height: 100%;

            .card-entry {
               display: flex;
               justify-content: center;
               align-items: center;
               gap: var(--g-agent);
               min-width: 0;
               transition: transform 0.3s ease;

               &.up {
                  transform: translateY(-8cqh);
               }
               &.down {
                  transform: translateY(8cqh);
               }

               /* Each card's width is the smaller of: the width a 5-up row
                  allows, and the width implied by the row's height (× 3/4).
                  Dividing by 5 regardless of count keeps a consistent card size
                  so fewer cards simply center with more space around them. */
               .card-slot {
                  --avail-w: calc((100cqw - 4 * var(--g-between)) / 5);
                  --w: min(calc(100cqh * 0.75), var(--avail-w));
                  width: var(--w);
                  height: calc(var(--w) * 4 / 3);

                  :deep(.card) {
                     width: 100%;
                     height: 100%;
                  }
               }
            }
         }

         .empty {
            color: rgba(255, 255, 255, 0.45);
            font-size: 1.5cqw;
            text-align: center;
         }
      }
   }
}
</style>
