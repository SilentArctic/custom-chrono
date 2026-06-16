import map from 'lodash/map';
import { createCard } from '@/stores/card.store';
import * as CreatorTypes from '@/constants/creatorTypes';
import * as Rarities from '@/constants/rarities.constants';

export function buildCardParams(cardStore) {
   const { cardType, syndicate, rarity, cards } = cardStore;
   const params = { cardType, syndicate, rarity };

   cards.forEach((card) => {
      Object.keys(card).forEach((key) => {
         if (key === 'rarity') return;

         let value =
            typeof card[key] === 'object'
               ? map(card[key], (v, k) => `${k}:${v}`).join(',')
               : card[key];
         value = encodeURIComponent(value);

         if (params[key]) {
            params[key] += `;${value}`;
         } else {
            params[key] = value;
         }
      });
   });

   return new URLSearchParams(params).toString();
}

/* Inverse of buildCardParams. Pure: returns a fresh state object without
   mutating any store, so it can be used both by card.store.setFromParams and
   to render an example card from a saved file inside a showcase preview. */
export function parseCardParams(params) {
   const NUMS = ['cost', 'strength', 'durability'];
   const state = {
      cardType: CreatorTypes.AGENT,
      syndicate: '',
      rarity: Rarities.COMMON,
      cards: [],
   };

   const ensureCard = (i) => {
      while (state.cards.length <= i) state.cards.push(createCard());
      return state.cards[i];
   };

   for (const [statName, value] of params) {
      const decodedValue = decodeURIComponent(value);
      if (!decodedValue) continue;
      if (statName === 'cardType') state.cardType = decodedValue;
      else if (statName === 'syndicate') state.syndicate = decodedValue;
      else if (statName === 'rarity') state.rarity = decodedValue;
      else {
         decodedValue.split(';').forEach((cardValue, i) => {
            const card = ensureCard(i);
            if (statName === 'artPos') {
               cardValue.split(',').forEach((coord) => {
                  const [name, position] = coord.split(':');
                  card.artPos[name] = Number(position);
               });
            } else {
               card[statName] = NUMS.includes(statName)
                  ? Number(cardValue)
                  : cardValue;
            }
         });
      }
   }

   /* a single-card type (action) should never carry a stray second card */
   if (state.cardType !== CreatorTypes.AGENT) state.cards = state.cards.slice(0, 1);
   if (state.cards.length === 0) state.cards.push(createCard());

   return state;
}

export function buildShowcaseParams(cardType, showcaseStore) {
   const { header, name, description, artCredit, background, backgroundPos, exampleFileId } = showcaseStore;
   const params = {
      cardType,
      header: encodeURIComponent(header),
      name: encodeURIComponent(name),
      description: encodeURIComponent(description),
      artCredit: encodeURIComponent(artCredit),
      background: encodeURIComponent(background),
      backgroundPos: encodeURIComponent(
         map(backgroundPos, (v, k) => `${k}:${v}`).join(','),
      ),
      exampleFileId: encodeURIComponent(exampleFileId),
   };
   return new URLSearchParams(params).toString();
}

export function parseShowcaseParams(params) {
   const state = {
      header: '',
      name: '',
      description: '',
      artCredit: '',
      background: '',
      backgroundPos: { x: 0, y: 0, z: 0, r: 0 },
      exampleFileId: '',
   };
   for (const [key, value] of params) {
      const decoded = decodeURIComponent(value);
      if (key === 'backgroundPos') {
         decoded.split(',').forEach((coord) => {
            const [axis, position] = coord.split(':');
            if (axis in state.backgroundPos) state.backgroundPos[axis] = Number(position);
         });
      } else if (key in state) {
         state[key] = decoded;
      }
   }
   return state;
}

/* Dispatch serialization based on the active creator type so callers
   (save, share) don't need to branch themselves. */
export function buildParams(cardStore, showcaseStore) {
   return CreatorTypes.Showcases.includes(cardStore.cardType)
      ? buildShowcaseParams(cardStore.cardType, showcaseStore)
      : buildCardParams(cardStore);
}

/* Inverse dispatcher: route a params string to the correct store based on
   its cardType (used by URL load and saved-file load). */
export function applyParams(params, { cardStore, showcaseStore }) {
   const cardType = params.get('cardType');
   if (cardType && CreatorTypes.Showcases.includes(cardType)) {
      cardStore.setCardType(cardType);
      showcaseStore.setFromParams(params);
      /* clear url to match card.store.setFromParams behaviour */
      window.history.replaceState(null, null, window.location.origin + window.location.pathname);
   } else {
      cardStore.setFromParams(params);
   }
}
