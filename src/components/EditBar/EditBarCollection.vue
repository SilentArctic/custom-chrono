<script setup>
import { BaseInput, BaseHr, BaseSelect } from '../common';
import EditBarArtSlider from './EditBarArtSlider.vue';
import FileSelect from '../Files/FileSelect.vue';
import { ref } from 'vue';
import { useShowcaseHandlers } from '@/composables/useShowcaseHandlers';
import { useCollectionCells } from '@/composables/useCollectionCells';

const { showcaseStore, handleValue, handleRange } = useShowcaseHandlers();
const { canAddSlot, fitsSelection } = useCollectionCells();

/* Shown briefly when a selection is rejected for exceeding the cell cap. */
const capMessage = ref('');

const handleFileId = (index, { target }) => {
   const value = target.value;
   if (!fitsSelection(index, value)) {
      /* Revert the native select — store state is unchanged, so a re-render
         wouldn't reset it on its own. */
      target.value = showcaseStore.collectionFileIds[index];
      capMessage.value = 'Agents take 2 slots — remove a card to add one.';
      return;
   }
   capMessage.value = '';
   showcaseStore.setCollectionFileId(index, value);
};
</script>

<template>
   <BaseInput
      name="name"
      placeholder="Collection Name"
      autocomplete="off"
      autocapitalize="words"
      :value="showcaseStore.name"
      @input="handleValue"
   />

   <BaseInput
      textarea
      name="description"
      placeholder="Description. Hint: [keyword], {card reference}, $timeline$, @ for chain symbol."
      rows="4"
      :value="showcaseStore.description"
      @input="handleValue"
   />

   <BaseHr />

   <BaseInput
      name="background"
      placeholder="Background Image URL"
      autocomplete="off"
      :value="showcaseStore.background"
      @input="handleValue"
   />

   <BaseInput
      name="artCredit"
      placeholder="Image Credit"
      autocomplete="off"
      :value="showcaseStore.artCredit"
      @input="handleValue"
   />

   <EditBarArtSlider
      label="x"
      :value="showcaseStore.backgroundPos.x"
      @handleRange="handleRange"
   />
   <EditBarArtSlider
      label="y"
      :value="showcaseStore.backgroundPos.y"
      @handleRange="handleRange"
   />
   <EditBarArtSlider
      label="z"
      :value="showcaseStore.backgroundPos.z"
      @handleRange="handleRange"
   />
   <EditBarArtSlider
      label="r"
      :value="showcaseStore.backgroundPos.r"
      @handleRange="handleRange"
   />

   <BaseHr />

   <div class="collection-slots">
      <div
         v-for="(id, i) in showcaseStore.collectionFileIds"
         :key="i"
         class="slot"
      >
         <FileSelect :value="id" @input="handleFileId(i, $event)" />
         <BaseSelect
            class="position-select"
            :value="showcaseStore.collectionPositions[i]"
            @change="({ target }) => showcaseStore.setCollectionPosition(i, target.value)"
         >
            <option value="up">↑</option>
            <option value="">—</option>
            <option value="down">↓</option>
         </BaseSelect>
         <button
            v-if="showcaseStore.collectionFileIds.length > 1"
            class="remove-btn"
            @click="showcaseStore.removeCollectionSlot(i)"
         >
            ×
         </button>
      </div>
      <button
         v-if="canAddSlot"
         class="add-btn"
         @click="showcaseStore.addCollectionSlot()"
      >
         + Add Card
      </button>
      <p v-if="capMessage" class="cap-message">{{ capMessage }}</p>
   </div>
</template>

<style lang="scss" scoped>
.collection-slots {
   display: flex;
   flex-direction: column;
   gap: 8px;
   margin-top: 4px;

   .slot {
      display: flex;
      gap: 6px;
      align-items: center;
      margin-bottom: 0.25rem;

      :deep(select) {
         flex: 1;
         min-width: 0;
         margin-bottom: 0;
      }

      .position-select {
         flex: 0 0 auto;
         width: 44px;
      }
   }

   .remove-btn {
      flex-shrink: 0;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 1rem;
      line-height: 1;
      padding: 4px 8px;
      cursor: pointer;

      &:hover {
         background: rgba(255, 255, 255, 0.1);
         color: white;
      }
   }

   .add-btn {
      background: transparent;
      border: 1px dashed rgba(255, 255, 255, 0.25);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.85rem;
      padding: 6px;
      cursor: pointer;
      text-align: center;

      &:hover {
         border-color: rgba(255, 255, 255, 0.5);
         color: rgba(255, 255, 255, 0.85);
      }
   }

   .cap-message {
      margin: 0;
      font-size: 0.8rem;
      color: rgba(255, 180, 120, 0.85);
      text-align: center;
   }
}
</style>
