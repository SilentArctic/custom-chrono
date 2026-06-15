import map from 'lodash/map';

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
