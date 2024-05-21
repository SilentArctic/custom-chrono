import { defineStore } from 'pinia';
import cloneDeep from 'lodash/cloneDeep';
import * as CardTypes from '../constants/cardTypes.constants';

const agentState = {
   name: '',
   art: '',
   artCredit: '',
   artPos: { x: 0, y: 0, z: 0, r: 0 },
   description: '',
   cost: 0,
   strength: 0,
   durability: 0,
};

export const useCardStore = defineStore('card', {
   state: () => ({
      cardType: CardTypes.AGENT,
      syndicate: '',
      cards: [
         cloneDeep(agentState),
         cloneDeep(agentState),
      ],
   }),

   actions: {
      setCardType(type) {
         this.cardType = type;
      },

      setSyndicate(syndicate) {
         this.syndicate = syndicate;
      },

      setValue(index, name, value) {
         this.cards[index][name] = value;
      },

      setArtPos(index, name, value) {
         this.cards[index].artPos[name] = Number(value);
      },

      setFromParams(params) {
         if (!params.size) return;

         for (const [statName, value] of params) {
            const decodedValue = decodeURIComponent(value);
            if (!decodedValue) continue;
            else if (statName === 'cardType') this.cardType = decodedValue;
            else if (statName === 'syndicate') this.syndicate = decodedValue;
            else {
               decodedValue.split(';').forEach((cardValue, i) => {
                  if (statName === 'artPos') {
                     /* assign artPos values */
                     cardValue.split(',').forEach(coord => {
                        const [name, position] = coord.split(':');
                        this.cards[i].artPos[name] = Number(position);
                     });
                  } else {
                     const nums = ['cost', 'strength', 'durability'];
                     this.cards[i][statName] = nums.includes(statName) ? Number(cardValue) : cardValue;
                  }
               });
            }
         }

         /* clear url to prevent confusion (live changes are not reflected in url) */
         window.history.replaceState(null, null, new URL(window.location.origin));
      },
   },
});
