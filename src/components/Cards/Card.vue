<script setup>
import {
   computed,
   ref,
   watch,
   onMounted,
   onBeforeUnmount,
   nextTick,
} from 'vue';
import * as CardTypes from '@/constants/cardTypes.constants';
import { transformDescription } from '@/utils';

const props = defineProps({
   cardType: {
      type: String,
      required: true,
      validator: (val) => Object.values(CardTypes).includes(val),
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
   actionSpeed: { type: String, default: 'immediate' },
   rarity: { type: String, default: 'rarity_common' },
});

const rarityIcon = computed(
   () => new URL(`../../assets/rarity_${props.rarity}.webp`, import.meta.url),
);

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

const costIcon = computed(() =>
   props.cardType === CardTypes.AGENT
      ? new URL('../../assets/power_cost.webp', import.meta.url)
      : new URL(
           `../../assets/power_cost_${props.actionSpeed}.webp`,
           import.meta.url,
        ),
);

/* Shrink the description font until the text fits its bounded box.
   The base size is card-relative (cqw); this only kicks in once a long
   description would otherwise overflow, mirroring the in-game behaviour. */
const MIN_FIT_SCALE = 0.45;
const descBox = ref(null);
const descText = ref(null);
const nameBox = ref(null);
const nameText = ref(null);

const fitName = () => {
   const box = nameBox.value;
   const text = nameText.value;
   if (!box || !text) return;

   let scale = 1;
   text.style.setProperty('--name-fit-scale', '1');

   let guard = 0;
   while (
      text.scrollWidth > box.clientWidth &&
      scale > MIN_FIT_SCALE &&
      guard < 40
   ) {
      scale = Math.max(MIN_FIT_SCALE, scale - 0.02);
      text.style.setProperty('--name-fit-scale', String(scale));
      guard += 1;
   }
};

const fitDescription = () => {
   const box = descBox.value;
   const text = descText.value;
   if (!box || !text) return;

   let scale = 1;
   text.style.setProperty('--fit-scale', '1');

   let guard = 0;
   while (
      text.scrollHeight > box.clientHeight &&
      scale > MIN_FIT_SCALE &&
      guard < 40
   ) {
      scale = Math.max(MIN_FIT_SCALE, scale - 0.02);
      text.style.setProperty('--fit-scale', String(scale));
      guard += 1;
   }
};

let resizeObserver;
onMounted(() => {
   resizeObserver = new ResizeObserver(() => {
      fitDescription();
      fitName();
   });
   resizeObserver.observe(descBox.value);
   resizeObserver.observe(nameBox.value);
   /* re-fit once custom fonts have loaded, since metrics change */
   document.fonts?.ready.then(() => {
      fitDescription();
      fitName();
   });
});

onBeforeUnmount(() => resizeObserver?.disconnect());

watch(transformedDescription, () => nextTick(fitDescription));
watch(
   () => props.name,
   () => nextTick(fitName),
);
</script>

<template>
   <div class="card">
      <img
         v-if="art"
         class="card-image"
         :src="art"
         :style="artStyle"
         alt="Card image"
      />

      <img
         src="../../assets/card_frame.webp"
         class="card-frame"
         alt="Card frame"
      />

      <div :class="['power-cost', cardType]">
         <img :src="costIcon" />
         <div class="cost">{{ cost }}</div>
      </div>

      <div v-if="cardType === CardTypes.ACTION" class="action-type">
         {{ actionSpeed }}
         <img
            v-if="actionSpeed !== 'immediate'"
            src="../../assets/chain.webp"
            alt="chain symbol"
         />
      </div>

      <div class="desc_box">
         <div class="desc-shade" />
         <img
            src="../../assets/desc_box.webp"
            alt="description-image"
            title="description-image"
         />

         <div ref="nameBox" class="name">
            <span ref="nameText" class="name-text">{{ name }}</span>
         </div>

         <div ref="descBox" class="description">
            <div
               ref="descText"
               class="description-text"
               v-html="transformedDescription"
            />
         </div>

         <div v-if="syndicate" class="syndicate">
            <img :src="syndicateIcon" />
         </div>
      </div>

      <img :src="rarityIcon" class="rarity-icon" alt="Rarity icon" />

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

.card {
   /* container-type makes the card a query container, so every cqw unit
      below is relative to the CARD's width rather than the viewport.
      This ties all text directly to the card at any screen size. */
   container-type: inline-size;
   max-height: 100vh;

   @media (max-width: $screen-sm) {
      /* 80vh = top of the EditBar strip; 120px = 10px body padding + 100px
         cards padding-top + 10px gap so the card clears the EditBar */
      max-height: calc(80vh - 120px);
   }
   background: $glass;
   aspect-ratio: 3/4;
   border-radius: 6.5%;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
   position: relative;
   backdrop-filter: $glass-blur;
   -webkit-backdrop-filter: $glass-blur;
   font-family: "Barlow Condensed", sans-serif;
   letter-spacing: 7.5%;
   text-shadow: -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000;
   overflow: hidden;

   .card-image {
      width: 100%;
   }

   .card-frame {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
   }

   .power-cost {
      height: 16%;
      aspect-ratio: 1;
      position: absolute;
      top: 2%;
      left: 2%;
      text-shadow: 0 0 5px black;
      &.action {
         height: 22%;
         top: 1%;
         left: -1%;

         .cost {
            top: 42%;
            left: 51%;
         }
      }

      .cost {
         position: absolute;
         top: 47%;
         left: 52%;
         transform: translate(-50%, -50%);
         font-size: calc(9cqw * var(--name-fit-scale, 1));
         font-weight: 600;
      }
   }

   .action-type {
      background: linear-gradient(to bottom, #4448, #0008);
      display: flex;
      align-items: center;
      border: 2px solid $gold;
      border-radius: 10px;
      padding: 0.25rem 0.5rem;
      position: absolute;
      top: 3%;
      right: 5%;
      font-size: 4.5cqw;
      text-shadow: 0 0 5px black;
      text-transform: uppercase;

      img {
         margin-left: 5px;
         width: 4cqw;
         height: auto;
      }
   }

   .desc_box {
      width: 97%;
      position: absolute;
      left: 1.25%;
      bottom: 3%;

      img {
         position: relative;
      }

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
         top: 7%;
         left: 7%;
         /* stop before syndicate icon (6% wide + 7% right margin + 2% gap) */
         right: 17%;
         height: 6cqw;
         display: flex;
         align-items: center;
         overflow: hidden;
         text-shadow: 0 0 5px black;

         .name-text {
            display: block;
            white-space: nowrap;
            font-size: calc(5cqw * var(--name-fit-scale, 1));
         }
      }

      .syndicate {
         width: 6%;
         position: absolute;
         top: 7.5%;
         right: 7%;
      }

      /* bounded text area below the name bar; content is vertically
         centred and shrunk to fit via the --fit-scale set in script */
      .description {
         position: absolute;
         top: 30%;
         right: 0;
         bottom: 21%;
         left: 0;
         padding: 0 9%;
         display: flex;
         justify-content: center;
         overflow: hidden;
         text-align: center;
         text-shadow: 0 0 5px black;

         .description-text {
            width: 100%;
            font-size: calc(6cqw * var(--fit-scale, 1));
            line-height: 1.3;
         }

         .highlight {
            color: #d7bb4b;
         }
      }
   }

   .rarity-icon {
      position: absolute;
      width: 10%;
      bottom: 2.4%;
      left: 50%;
      z-index: 5;
      transform: translateX(-50%);
   }

   .agent-stats {
      width: 100%;
      position: absolute;
      bottom: -2%;
      left: -0.4%;

      .strength,
      .durability {
         position: absolute;
         bottom: 30%;
         font-size: calc(6.5cqw * var(--name-fit-scale, 1));
         font-weight: 600;
      }

      .strength {
         left: 13%;
      }

      .durability {
         right: 11%;
      }
   }

   .credits {
      width: 100%;
      display: flex;
      justify-content: space-between;
      padding: 0 4.5%;
      position: absolute;
      bottom: 1%;
      font-size: 2cqw;
   }
}
</style>
