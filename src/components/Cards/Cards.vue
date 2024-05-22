<script setup>
import { ref, computed } from 'vue';
import Card from './Card.vue';
import { useCardStore } from '@/stores/card.store';
import * as CardTypes from '@/constants/cardTypes.constants';

const cardStore = useCardStore();

/* slide Agent cards horizontally on mobile displays */
const isMobileSecondCard = ref(false);
const mobilePos = computed(() => {
   if (window.innerWidth > 750 || cardStore.cardType !== CardTypes.AGENT) return;
   const translation = isMobileSecondCard.value ? -85 : 0;
   return { transform: `translateX(${translation}%)` };
});
</script>

<template>
   <div
      id="cards"
      :class="['cards', {
         agent: cardStore.cardType === CardTypes.AGENT,
      }]"
      :style="mobilePos"
      @click="isMobileSecondCard = !isMobileSecondCard"
   >
      <div id="print-wrapper-all" class="print-wrapper-all">
         <div id="print-wrapper-0" class="print-wrapper-card">
            <Card
               v-bind="cardStore.cards[0]"
               :cardType="cardStore.cardType"
               :syndicate="cardStore.syndicate"
            />
         </div>

         <div v-if="cardStore.cardType === CardTypes.AGENT" class="spacer" />

         <div v-if="cardStore.cardType === CardTypes.AGENT"
            id="print-wrapper-1"
            class="print-wrapper-card"
         >
            <Card
               v-bind="cardStore.cards[1]"
               :cardType="cardStore.cardType"
               :syndicate="cardStore.syndicate"
            />
         </div>
      </div>
   </div>
</template>

<style lang="scss" scoped>
.cards {
   height: 100%;
   flex: 3.75;
   display: flex;
   justify-content: center;
   align-items: center;
   padding-left: 10px;

   .print-wrapper-all {
      width: 100%;
      display: flex;
      justify-content: center;

      @media (max-width: $screen-sm) {
         justify-content: flex-start;
      }
   }

   .print-wrapper-card {
      width: 50%;

      @media (max-width: $screen-sm) {
         width: 100%;
         min-width: 90%;
         &:first-child:not(:last-child) {
            margin-right: 20px;
         }
      }
   }

   .spacer {
      height: 100%;
      width: 5%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
         width: 50px;
      }

      @media (max-width: $screen-sm) {
         height: 50%;
         width: 50px;
         position: fixed;
         right: 5%;
         z-index: 2;
      }
   }

   @media (max-width: $screen-sm) {
      justify-content: flex-start;
      flex: 1;
      align-items: flex-start;
      padding: 100px 0 0;
      /* transition used for translateX (see script ^) */
      transition: all 0.15s ease-in-out;

      &.agent { justify-content: flex-start; }
   }
}
</style>
