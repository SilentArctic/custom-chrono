<script setup>
import { computed } from 'vue';
import { useCardStore } from '@/stores/card.store';
import * as CreatorTypes from '@/constants/creatorTypes.js';
import PreviewCards from './PreviewCards/PreviewCards.vue';
import PreviewShowcase from './PreviewShowcase/PreviewShowcase.vue';
import PreviewCollection from './PreviewShowcase/PreviewCollection.vue';

const cardStore = useCardStore();
const isCards = computed(() => CreatorTypes.Cards.includes(cardStore.cardType));
const isShowcase = computed(() => CreatorTypes.Showcases.includes(cardStore.cardType));
const isFeature = computed(() => cardStore.cardType === CreatorTypes.FEATURE);
const isCollection = computed(() => cardStore.cardType === CreatorTypes.COLLECTION);
</script>

<template>
   <PreviewCards v-if="isCards" />
   <template v-else-if="isShowcase">
      <PreviewShowcase v-if="isFeature" />
      <PreviewCollection v-else-if="isCollection" />
   </template>
</template>

<style lang="scss" scoped></style>
