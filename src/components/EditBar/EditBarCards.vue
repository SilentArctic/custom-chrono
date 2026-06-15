<script setup>
import { useCardStore } from '@/stores/card.store';
import * as Syndicates from '@/constants/syndicates.constants';
import * as Rarities from '@/constants/rarities.constants';
import * as CreatorTypes from '@/constants/creatorTypes.js';
import EditBarCardStats from './EditBarCardStats.vue';
import { BaseHr, BaseSelect } from '../common';

const cardStore = useCardStore();
</script>

<template>
   <BaseSelect
      name="syndicate"
      class="top-select"
      :value="cardStore.syndicate"
      @input="cardStore.setSyndicate($event.target.value)"
   >
      <option value="">Choose a Syndicate...</option>
      <option
         v-for="syndicate in Syndicates"
         :key="syndicate"
         :value="syndicate"
      >
         {{ syndicate }}
      </option>
   </BaseSelect>

   <BaseSelect
      name="rarity"
      :value="cardStore.rarity"
      @input="cardStore.setRarity($event.target.value)"
   >
      <option v-for="rarity in Rarities.ALL" :key="rarity" :value="rarity">
         {{ rarity }}
      </option>
   </BaseSelect>

   <BaseHr />

   <EditBarCardStats
      :cardType="cardStore.cardType"
      :card="cardStore.cards[0]"
      @updateValue="(name, val) => cardStore.setValue(0, name, val)"
      @updateArtPos="(name, val) => cardStore.setArtPos(0, name, val)"
   />

   <div v-if="cardStore.cardType === CreatorTypes.AGENT">
      <BaseHr />
      <EditBarCardStats
         :cardType="cardStore.cardType"
         :card="cardStore.cards[1]"
         @updateValue="(name, val) => cardStore.setValue(1, name, val)"
         @updateArtPos="(name, val) => cardStore.setArtPos(1, name, val)"
      />
   </div>
</template>

<style lang="scss" scoped>
.top-select {
   margin-bottom: 10px;
}
</style>
