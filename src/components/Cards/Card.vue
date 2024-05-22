<script setup>
import { computed } from 'vue';
import * as CardTypes from '@/constants/cardTypes.constants';
import { transformDescription } from '@/utils';

const props = defineProps({
   cardType: {
      type: String,
      required: true,
      validator: val => Object.values(CardTypes).includes(val),
   },
   name: { type: String, required: true },
   art: { type: String, required: true },
   artCredit: { type: String, required: true },
   artPos: { type: Object, required: true },
   cost: { type: Number, required: true },
   description: { type: String, required: true },
   syndicate: { type: String, required: true },
   strength: { type: Number },
   durability: { type: Number },
});

const syndicateIcon = computed(() => {
   if (!props.syndicate) return '';
   return new URL(`../../assets/${props.syndicate}.webp`, import.meta.url);
});

const transformedDescription = computed(() =>
   transformDescription(props.description),
);

const artStyle = computed(() => {
   const { x, y, z, r } = props.artPos;
   return {
      transform: `translate(${x / 5}%, ${y / 5}%) rotate(${r}deg)`,
      scale: 1 + z / 100,
   };
});
</script>

<template>
   <div class="card">
      <img v-if="art" class="card-image" :src="art" :style="artStyle" alt="Card image" />

      <div class="power-cost">
         <img src="../../assets/power_cost.webp"/>
         <div class="cost">{{ cost }}</div>
      </div>

      <div class="desc_box">
         <div class="desc-shade" />
         <img src="../../assets/desc_box.webp" alt="description-image" title="description-image" />

         <div class="name">{{ name }}</div>

         <div class="description" v-html="transformedDescription" />

         <div v-if="syndicate" class="syndicate">
            <img :src="syndicateIcon" />
         </div>
      </div>

      <div v-if="cardType === CardTypes.AGENT" class="agent-stats">
         <img src="../../assets/agent_stats.webp" />
         <div class="strength">{{ strength }}</div>
         <div class="durability">{{ durability }}</div>
      </div>

      <div class="credits">
         <div class="site">https://customchrono.netlify.app</div>
         <div class="art">Art: {{ artCredit }}</div>
      </div>
   </div>
</template>

<style lang="scss" scoped>
/* % and vw used extensively to maintain card scale regardless of screen size */

$card-border: 10px;
.card {
   max-height: 100vh;
   aspect-ratio: 3/4;
   background: rgba(255, 255, 255, 0.03);
   border: 1px solid rgba(255, 255, 255, 0.1);
   border-radius: $card-border;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
   position: relative;
   backdrop-filter: blur(3.9px);
   -webkit-backdrop-filter: blur(3.9px);
   font-family: "Noto Serif", serif;
   overflow: hidden;

   .card-image {
      width: 100%;
   }

   .power-cost {
      height: 13.33%;
      aspect-ratio: 1;
      position: absolute;
      top: 2%;
      left: 2%;
      text-shadow: 0 0 5px black;

      .cost {
         position: absolute;
         top: 47%;
         left: 50%;
         transform: translate(-50%, -50%);
         font-size: 2.5vw;

         @media screen and (min-width: 2000px) {
            font-size: 2.5rem;
         }
         @media (max-width: $screen-sm) {
            font-size: 6vw;
         }
      }
   }

   .desc_box {
      width: 100%;
      position: absolute;
      bottom: 3%;

      img { position: relative; }

      .desc-shade {
         height: 90%;
         width: 95%;
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
         &:before {
            background: rgba(#2b0c25, 0.5);
            position: absolute;
            z-index: -1;
            inset: 0;
            box-shadow: inset 0 0 50px rgba(0, 0, 0, 0.75);
            content: '';
            clip-path: polygon(
               0% 0%,
               100% 0%,
               98% 0%,
               98% 98%,
               2.5% 98%,
               2.5% 20%
            );
         }
      }

      .name {
         position: absolute;
         top: 8%;
         left: 7%;
         font-size: 1.25vw;
         text-shadow: 0 0 5px black;

         @media screen and (min-width: 2000px) {
            font-size: 1.2rem;
         }
         @media (max-width: $screen-sm) {
            top: 8%;
            font-size: 3vw;
         }
      }

      .syndicate {
         width: 6%;
         position: absolute;
         top: 7.5%;
         right: 7%;
      }

      .description {
         width: 100%;
         position: absolute;
         top: 0%;
         padding: 18% 10% 0 10%;
         text-align: center;
         font-size: 1.2vw;
         text-shadow: 0 0 5px black;

         @media screen and (min-width: 2000px) {
            font-size: 1.5rem;
         }
         @media (max-width: $screen-sm) {
            font-size: 2.5vw;
         }

         .highlight {
            color: #d7bb4b;
         }
      }
   }

   .agent-stats {
      width: 100%;
      position: absolute;
      bottom: -2%;
      left: -0.4%;

      .strength, .durability {
         position: absolute;
         bottom: 30%;
         font-size: 2.5vw;
         text-shadow: 0 0 5px black;

         @media screen and (min-width: 2000px) {
            font-size: 2.5rem;
         }
         @media (max-width: $screen-sm) {
            font-size: 5vw;
         }
      }

      .strength { left: 13%; }

      .durability { right: 11%; }
   }

   .credits {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 2%;
      position: absolute;
      bottom: 0.5%;
      font-size: 0.6vw;
      @media (max-width: $screen-sm) {
         font-size: 2.25vw;
      }
   }
}
</style>
