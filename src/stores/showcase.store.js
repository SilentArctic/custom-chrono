import { defineStore } from 'pinia';
import { parseShowcaseParams } from '../utils/serializeState';

const createShowcase = () => ({
   header: '',
   name: '',
   description: '',
   artCredit: '',
   background: '',
   backgroundPos: { x: 0, y: 0, z: 0, r: 0 },
   exampleFileId: '',
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

      reset() {
         Object.assign(this, createShowcase());
      },

      setFromParams(params) {
         Object.assign(this, parseShowcaseParams(params));
      },
   },
});
