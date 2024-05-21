<script setup>
import { computed } from 'vue';
import * as CardTypes from '@/constants/cardTypes.constants';
import transformDescription from '@/utils/transformDescription';

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
         <div class="name-shade" />
         <div class="desc-shade" />

         <div class="name">{{ name }}</div>

         <div class="description" v-html="transformedDescription" />
         <img src="../../assets/desc_box.webp" alt="description-image" title="description-image" />

         <div v-if="syndicate" class="syndicate">
            <img :src="`src/assets/${syndicate}.webp`" />
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
   width: 40%;
   max-width: 450px;
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

   @media (max-width: $screen-sm) {
      width: 100%;
      max-width: none;
      min-width: 90%;
      &:first-child:not(:last-child) {
         margin-right: 20px;
      }
   }

   .power-cost {
      height: 13.33%;
      aspect-ratio: 1;
      position: absolute;
      top: 2%;
      left: 2%;

      .cost {
         position: absolute;
         top: 47%;
         left: 50%;
         transform: translate(-50%, -50%);
         font-size: 2vw;

         @media screen and (min-width: 1600px) {
            font-size: 30px;
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

      .name-shade {
         height: 9%;
         width: 2.1%;
         background: rgba(0, 0, 0, 0.8);
         position: absolute;
         left: 2.9%;
         top: 7%;
      }

      .desc-shade {
         height: 90%;
         width: 90%;
         background: rgba(0, 0, 0, 0.8);
         position: absolute;
         top: 50%;
         left: 50%;
         transform: translate(-50%, -50%);
      }

      .name {
         position: absolute;
         top: 8%;
         left: 7%;
         font-size: 1vw;

         @media screen and (min-width: 1600px) {
            font-size: 15px;
         }
         @media (max-width: $screen-sm) {
            font-size: 4vw;
         }
      }

      .syndicate {
         width: 6.5%;
         position: absolute;
         top: 7%;
         right: 6.5%;
      }

      .description {
         width: 100%;
         position: absolute;
         top: 0%;
         padding: 18% 10% 0 10%;
         text-align: center;
         font-size: 1vw;

         @media screen and (min-width: 1600px) {
            font-size: 15px;
         }
         @media (max-width: $screen-sm) {
            font-size: 4vw;
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
         font-size: 2vw;

         @media screen and (min-width: 1600px) {
            font-size: 30px;
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