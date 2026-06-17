import { defineStore } from 'pinia';
import { parseShowcaseParams } from '../utils/serializeState';
import { COLLECTION_SLOTS_INITIAL, COLLECTION_SLOTS_MAX } from '../constants/creatorTypes';

const createShowcase = () => ({
   header: '',
   name: '',
   description: '',
   artCredit: '',
   background: '',
   backgroundPos: { x: 0, y: 0, z: 0, r: 0 },
   exampleFileId: '',
   collectionFileIds: Array(COLLECTION_SLOTS_INITIAL).fill(''),
   collectionPositions: Array(COLLECTION_SLOTS_INITIAL).fill(''),
});

export const useShowcaseStore = defineStore('showcase', {
   state: () => createShowcase(),

   actions: {
      setValue(name, value) {
         this[name] = value;
      },

      setBackgroundPos(name, value) {
         this.backgroundPos[name] = Number(value);
      },

      addCollectionSlot() {
         if (this.collectionFileIds.length < COLLECTION_SLOTS_MAX) {
            this.collectionFileIds.push('');
            this.collectionPositions.push('');
         }
      },

      removeCollectionSlot(index) {
         if (this.collectionFileIds.length > 1) {
            this.collectionFileIds.splice(index, 1);
            this.collectionPositions.splice(index, 1);
         }
      },

      setCollectionFileId(index, id) {
         this.collectionFileIds[index] = id;
      },

      setCollectionPosition(index, position) {
         this.collectionPositions[index] = position;
      },

      reset() {
         Object.assign(this, createShowcase());
      },

      setFromParams(params) {
         Object.assign(this, parseShowcaseParams(params));
      },
   },
});
