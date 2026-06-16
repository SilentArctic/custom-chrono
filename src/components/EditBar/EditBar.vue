<script setup>
import { ref, computed } from 'vue';
import { useCardStore } from '@/stores/card.store';
import * as CreatorTypes from '@/constants/creatorTypes';
import { BaseSelect } from '../common';
import EditBarCards from './EditBarCards.vue';
import EditBarShowcases from './EditBarShowcases.vue';

const isMobileLow = ref(true);
const cardStore = useCardStore();

const isCards = computed(() => CreatorTypes.Cards.includes(cardStore.cardType));
const isShowcase = computed(() =>
   CreatorTypes.Showcases.includes(cardStore.cardType),
);
</script>

<template>
   <div :class="['edit-bar', { low: isMobileLow }]">
      <div class="mobile-move" @click="isMobileLow = !isMobileLow">
         <span :class="{ low: isMobileLow }">&#8249;</span>
      </div>

      <BaseSelect
         name="card-type"
         class="top-select"
         :value="cardStore.cardType"
         @input="cardStore.setCardType($event.target.value)"
      >
         <option v-for="cType in CreatorTypes.ALL" :key="cType" :value="cType">
            {{ cType }}
         </option>
      </BaseSelect>

      <EditBarCards v-if="isCards" />
      <EditBarShowcases v-else-if="isShowcase" />
   </div>
</template>

<style lang="scss" scoped>
.edit-bar {
   height: 100%;
   min-width: 400px;
   max-width: 400px;
   flex: 1;
   background: $glass;
   display: flex;
   flex-direction: column;
   border: $glass-border;
   border-radius: 10px;
   padding: 10px;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
   backdrop-filter: $glass-blur;
   -webkit-backdrop-filter: $glass-blur;
   overflow: auto;
   z-index: 3;
   &::-webkit-scrollbar {
      width: 17px;
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

   @media (max-width: $screen-sm) {
      height: calc(100% - 10%);
      width: 100%;
      min-width: 100%;
      max-width: none;
      background:
         radial-gradient(ellipse at top, rgba($blue, 0.6) 0%, transparent 55%),
         radial-gradient(
            ellipse at bottom right,
            rgba($red, 0.4) 0%,
            transparent 55%
         ),
         $bg-dark;
      position: absolute;
      top: 10%;
      left: 0;
      padding-top: 0;
      padding-right: 0;
      transition: top 0.15s ease-in-out;
      &.low {
         $distance: 80%;
         height: calc(100% - #{$distance});
         top: $distance;
         background: rgba(0, 0, 0, 0.4);
      }
   }

   .mobile-move {
      display: none;

      span {
         transform: rotate(-90deg);
         transition: all 0.15s ease-in-out;
         &.low {
            transform: rotate(90deg);
         }
      }

      @media (max-width: $screen-sm) {
         width: 100%;
         // background: #280e23;
         background: $glass;
         display: flex;
         justify-content: center;
         align-items: center;
         border-radius: 5px;
         margin-bottom: 10px;
         position: sticky;
         top: 0;
         font-size: 2rem;
         line-height: 120%;
         transition: all 0.15s ease-in-out;
      }
   }

   .top-select {
      margin-bottom: 10px;
   }
}
</style>
