<script setup>
import { ref, computed } from 'vue';
import Card from './Card.vue';
import { useCardStore } from '@/stores/card.store';
import * as CardTypes from '@/constants/cardTypes.constants';

const cardStore = useCardStore();

/* slide Agent cards horizontally on mobile displays */
const isMobileSecondCard = ref(false);
const mobilePos = computed(() => {
   if (screen.width > 750 || cardStore.cardType !== CardTypes.AGENT) return;
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
      <Card
         id="card-0"
         v-bind="cardStore.cards[0]"
         :cardType="cardStore.cardType"
         :syndicate="cardStore.syndicate"
      />

      <div v-if="cardStore.cardType === CardTypes.AGENT" class="spacer" />

      <Card v-if="cardStore.cardType === CardTypes.AGENT"
         id="card-1"
         v-bind="cardStore.cards[1]"
         :cardType="cardStore.cardType"
         :syndicate="cardStore.syndicate"
      />
   </div>
</template>

<style lang="scss" scoped>
.cards {
   height: 100%;
   flex: 3.75;
   display: flex;
   justify-content: center;
   align-items: center;

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
