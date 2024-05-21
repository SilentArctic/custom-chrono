<script setup>
import { ref } from 'vue';
import { useCardStore } from '@/stores/card.store';
import * as CardTypes from '@/constants/cardTypes.constants';
import * as Syndicates from '@/constants/syndicates.constants';
import { BaseHr, BaseSelect } from '../common';
import EditBarCardStats from './EditBarCardStats.vue';

const isMobileLow = ref(true);
const cardStore = useCardStore();
</script>

<template>
   <div :class="['edit-bar', { low: isMobileLow }]">
      <div class="mobile-move" @click="isMobileLow = !isMobileLow">
         <span :class="{ low: isMobileLow }">&#8249;</span>
      </div>

      <BaseSelect
         name="card-type"
         class="card-type"
         :value="cardStore.cardType"
         @input="cardStore.setCardType($event.target.value)"
      >
         <option v-for="cType in CardTypes"
            :key="cType"
            :value="cType"
         >
            {{ cType }}
         </option>
      </BaseSelect>

      <BaseSelect
         name="syndicate"
         :value="cardStore.syndicate"
         @input="cardStore.setSyndicate($event.target.value)"
      >
         <option value="">Choose a Syndicate...</option>
         <option v-for="syndicate in Syndicates"
            :key="syndicate"
            :value="syndicate"
         >
            {{ syndicate }}
         </option>
      </BaseSelect>

      <BaseHr />

      <EditBarCardStats
         :cardType="cardStore.cardType"
         :card="cardStore.cards[0]"
         @updateValue="(name, val) => cardStore.setValue(0, name, val)"
         @updateArtPos="(name, val) => cardStore.setArtPos(0, name, val)"
      />

      <div v-if="cardStore.cardType === CardTypes.AGENT">
         <BaseHr />
         <EditBarCardStats
            :cardType="cardStore.cardType"
            :card="cardStore.cards[1]"
            @updateValue="(name, val) => cardStore.setValue(1, name, val)"
            @updateArtPos="(name, val) => cardStore.setArtPos(1, name, val)"
         />
      </div>
   </div>
</template>

<style lang="scss" scoped>
.edit-bar {
   height: 100%;
   flex: 1;
   min-width: 300px;
   max-width: 400px;
   background: rgba(255, 255, 255, 0.03);
   display: flex;
   flex-direction: column;
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: 10px;
   padding: 10px;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
   backdrop-filter: blur(3.9px);
   -webkit-backdrop-filter: blur(3.9px);
   overflow: auto;
   z-index: 3;
   &::-webkit-scrollbar { width: 17px; }
   &::-webkit-scrollbar-track { background: transparent; }
   &::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border: 6px solid transparent;
      border-radius: 10px;
      background-clip: padding-box;
   }

   @media (max-width: $screen-sm) {
      height: calc(100% - 10%);
      width: 100%;
      max-width: none;
      background: linear-gradient(to bottom right, $blue, $red);
      position: absolute;
      top: 10%;
      left: 0;
      padding-top: 0;
      transition: top 0.15s ease-in-out;
      &.low {
         height: calc(100% - 70%);
         top: 70%;
         background: rgba(0, 0, 0, 0.4);
      }
   }

   .mobile-move {
      display: none;

      span {
         transform: rotate(-90deg);
         transition: all 0.15s ease-in-out;
         &.low { transform: rotate(90deg); }
      }

      @media (max-width: $screen-sm) {
         width: 100%;
         background: #280e23;
         // background: $blue;
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

   .card-type {
      margin-bottom: 10px;
   }
}
</style>
