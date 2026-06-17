<script setup>
import { computed, onMounted } from 'vue';
import { useShowcaseStore } from '@/stores/showcase.store';
import { useFilesStore } from '@/stores/files.store';
import { parseCardParams } from '@/utils/serializeState';
import { transformDescription } from '@/utils';
import * as CardTypes from '@/constants/creatorTypes';
import PreviewCard from '../PreviewCards/PreviewCard.vue';
import PreviewCredits from './PreviewCredits.vue';
import { useBackgroundStyle } from '@/composables/useBackgroundStyle';

const showcaseStore = useShowcaseStore();
const filesStore = useFilesStore();

onMounted(() => filesStore.load());

const exampleFile = computed(() =>
   filesStore.files.find((f) => f.id === showcaseStore.exampleFileId),
);

const exampleState = computed(() =>
   exampleFile.value
      ? parseCardParams(new URLSearchParams(exampleFile.value.params))
      : null,
);

const isAgentExample = computed(
   () => exampleState.value?.cardType === CardTypes.AGENT,
);

const transformedDescription = computed(() =>
   transformDescription(showcaseStore.description),
);

const backgroundStyle = useBackgroundStyle();
</script>

<template>
   <div class="showcase">
      <div id="showcase-print-wrapper" class="print-wrapper">
         <img
            v-if="showcaseStore.background"
            class="bg-image"
            :src="showcaseStore.background"
            :style="backgroundStyle"
            alt=""
         />

         <div class="info">
            <h1 class="header">{{ showcaseStore.header }}</h1>
            <h1 class="feature-name">{{ showcaseStore.name }}</h1>
            <div class="feature-description" v-html="transformedDescription" />
         </div>

         <div class="example">
            <div
               v-if="exampleState"
               class="example-cards"
               :class="{ agent: isAgentExample }"
            >
               <div class="example-card">
                  <PreviewCard
                     v-bind="exampleState.cards[0]"
                     :cardType="exampleState.cardType"
                     :syndicate="exampleState.syndicate"
                     :rarity="exampleState.rarity"
                  />
               </div>
               <div
                  v-if="isAgentExample && exampleState.cards[1]"
                  class="example-card"
               >
                  <PreviewCard
                     v-bind="exampleState.cards[1]"
                     :cardType="exampleState.cardType"
                     :syndicate="exampleState.syndicate"
                     :rarity="exampleState.rarity"
                  />
               </div>
            </div>
            <p v-else class="example-empty">
               Select an example card from your saved files.
            </p>
         </div>

         <PreviewCredits :art-credit="showcaseStore.artCredit" />
      </div>
   </div>
</template>

<style lang="scss" scoped>
/* % / cqw / rem used throughout so the showcase scales to any screen size */
.showcase {
   height: 100%;
   flex: 3.75;
   display: flex;
   align-items: center;
   justify-content: center;
   gap: 2rem;
   padding-left: 10px;
   overflow: hidden;
   font-family: 'Barlow Condensed', sans-serif;

   @media (max-width: $screen-sm) {
      flex-direction: column;
      justify-content: flex-start;
      align-items: stretch;
      gap: 1rem;
      padding: 100px 0 0;
      overflow-y: auto;
   }

   .print-wrapper {
      width: 100%;
      aspect-ratio: 16 / 9;
      display: flex;
      align-items: center;
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

      .header {
         font-style: italic;
      }

      $info-width: 35%;
      .info {
         width: $info-width;
         position: relative;
         z-index: 1;
         height: 100%;
         display: flex;
         flex-direction: column;
         justify-content: center;
         gap: 1.5rem;
         padding: 0 2rem;
         text-align: center;
         text-shadow: 0 0 8px rgba(0, 0, 0, 0.85);
         background:
            radial-gradient(
               ellipse at 50% 35%,
               rgba($gold, 0.1) 0%,
               transparent 60%
            ),
            linear-gradient(
               165deg,
               rgba(32, 32, 40, 0.92) 0%,
               rgba(12, 12, 16, 0.9) 100%
            );
         border-right: 2px solid rgba(255, 255, 255, 0.25);
         border-radius: 10px 0 0 10px;
         box-shadow: inset 0 0 70px rgba(0, 0, 0, 0.55);

         @media (max-width: $screen-sm) {
            max-width: none;
         }

         .header {
            font-style: italic;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.18em;
            font-size: clamp(0.85rem, 1.5vw, 1.3rem);
            color: rgba(255, 255, 255, 0.72);
            margin: 0;

            /* gold accent rule beneath the eyebrow label */
            &::after {
               content: '';
               display: block;
               width: 45%;
               height: 2px;
               margin: 0.2rem auto 0;
               background: linear-gradient(
                  90deg,
                  transparent,
                  $gold,
                  transparent
               );
            }
         }

         .feature-name {
            font-size: clamp(2rem, 4.5vw, 3.4rem);
            font-weight: 700;
            line-height: 1.05;
            color: $gold;
            margin: 0;
         }

         .feature-description {
            font-size: clamp(1rem, 1.4vw, 1.2rem);
            line-height: 1.5;
            white-space: pre-line;
            color: rgba(255, 255, 255, 0.92);
         }
      }

      .example {
         width: calc(100% - #{$info-width});
         height: 100%;
         box-sizing: border-box;
         display: flex;
         justify-content: center;
         align-items: center;
         padding: 1.5rem 2rem;
         position: relative;
         z-index: 1;

         @media (max-width: $screen-sm) {
            max-width: none;
         }

         .example-cards {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 1rem;
            width: 100%;
            height: 100%;
         }

         /* single card: drive size from the (definite) height so the tall 3/4
            card can never exceed the short 16/9 wrapper. The aspect-ratio on
            this wrapper yields a definite width; the card just fills it. */
         .example-cards:not(.agent) .example-card {
            height: 100%;
            aspect-ratio: 3 / 4;
            max-width: 100%;

            :deep(.card) {
               width: 100%;
               height: 100%;
            }
         }

         /* agent pair: two smaller width-driven cards sit comfortably */
         .example-cards.agent .example-card {
            width: 100%;
            max-width: 300px;
         }

         .example-empty {
            color: rgba(255, 255, 255, 0.45);
            font-size: 1rem;
            text-align: center;
            align-self: center;
         }
      }

   }
}
</style>
