<script setup>
import { computed } from 'vue';
import { useCardStore } from '@/stores/card.store';
import * as CreatorTypes from '@/constants/creatorTypes.js';
import PreviewCards from './PreviewCards/PreviewCards.vue';
import PreviewShowcase from './PreviewShowcase/PreviewShowcase.vue';

const cardStore = useCardStore();
const isCards = computed(() => CreatorTypes.Cards.includes(cardStore.cardType));
const isShowcase = computed(() =>
   CreatorTypes.Showcases.includes(cardStore.cardType),
);
</script>

<template>
   <PreviewCards v-if="isCards" />
   <PreviewShowcase v-else-if="isShowcase" />
</template>

<style lang="scss" scoped></style>
