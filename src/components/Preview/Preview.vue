<script setup>
import { computed } from 'vue';
import { useCardStore } from '@/stores/card.store';
import * as CreatorTypes from '@/constants/creatorTypes.js';
import PreviewCards from './PreviewCards/PreviewCards.vue/index.js';

const cardStore = useCardStore();
const isCards = computed(() => CreatorTypes.Cards.includes(cardStore.cardType));
</script>

<template>
   <PreviewCards v-if="isCards" />
</template>

<style lang="scss" scoped></style>
