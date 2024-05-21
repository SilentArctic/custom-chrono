<script setup>
import * as CardTypes from '@/constants/cardTypes.constants';
import ArtSlider from './ArtSlider.vue';

const emit = defineEmits(['updateValue', 'updateArtPos']);

defineProps({
   cardType: {
      type: String,
      required: true,
      validator: val => Object.values(CardTypes).includes(val),
   },
   card: { type: Object, required: true },
});

const handleValue = ({ target: { name, value } }) => {
   emit('updateValue', name, value);
};

const handleNumValue = ({ target: { name, value } }) => {
   handleValue({ target: { name, value: Number(value) } });
};

const handleRange = ({ target: { name, value } }) => {
   emit('updateArtPos', name, value);
};
</script>

<template>
   <div class="card-stats">
      <input
         name="name"
         placeholder="Name"
         autocomplete="off"
         :value="card.name"
         @input="handleValue"
      />

      <input
         name="art"
         placeholder="Image URL"
         autocomplete="off"
         :value="card.art"
         @input="handleValue"
      />
      <input
         name="artCredit"
         placeholder="Image Credit"
         autocomplete="off"
         :value="card.artCredit"
         @input="handleValue"
      />
      <ArtSlider label="x" :value="card.artPos.x" @handleRange="handleRange" />
      <ArtSlider label="y" :value="card.artPos.y" @handleRange="handleRange" />
      <ArtSlider label="z" :value="card.artPos.z" @handleRange="handleRange" />
      <ArtSlider label="r" :value="card.artPos.r" @handleRange="handleRange" />

      <div class="row">
         <input
            type="number"
            name="cost"
            placeholder="Cost"
            autocomplete="off"
            :value="card.cost"
            @input="handleNumValue"
         />
         <input v-if="cardType === CardTypes.AGENT"
            type="number"
            name="strength"
            placeholder="Strength"
            autocomplete="off"
            :value="card.strength"
            @input="handleNumValue"
         />
         <input v-if="cardType === CardTypes.AGENT"
            type="number"
            name="durability"
            placeholder="Durability"
            autocomplete="off"
            :value="card.durability"
            @input="handleNumValue"
         />
      </div>

      <textarea
         name="description"
         placeholder="Description"
         rows="6"
         :value="card.description"
         @input="handleValue"
      />
   </div>
</template>

<style lang="scss" scoped>
.card-stats {
   .row {
      width: 100%;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
   }
}
</style>
