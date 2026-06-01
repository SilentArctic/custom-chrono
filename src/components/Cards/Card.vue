<script setup>
import {
   computed,
   ref,
   watch,
   onMounted,
   onBeforeUnmount,
   nextTick,
} from "vue";
import * as CardTypes from "@/constants/cardTypes.constants";
import { transformDescription } from "@/utils";

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
});

const syndicateIcon = computed(() => {
   if (!props.syndicate) return "";
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

/* Shrink the description font until the text fits its bounded box.
   The base size is card-relative (cqw); this only kicks in once a long
   description would otherwise overflow, mirroring the in-game behaviour. */
const MIN_FIT_SCALE = 0.45;
const descBox = ref(null);
const descText = ref(null);

const fitDescription = () => {
   const box = descBox.value;
   const text = descText.value;
   if (!box || !text) return;

   let scale = 1;
   text.style.setProperty("--fit-scale", "1");

   let guard = 0;
   while (
      text.scrollHeight > box.clientHeight &&
      scale > MIN_FIT_SCALE &&
      guard < 40
   ) {
      scale = Math.max(MIN_FIT_SCALE, scale - 0.02);
      text.style.setProperty("--fit-scale", String(scale));
      guard += 1;
   }
};

let resizeObserver;
onMounted(() => {
   resizeObserver = new ResizeObserver(() => fitDescription());
   resizeObserver.observe(descBox.value);
   /* re-fit once custom fonts have loaded, since metrics change */
   document.fonts?.ready.then(fitDescription);
});

onBeforeUnmount(() => resizeObserver?.disconnect());

watch(transformedDescription, () => nextTick(fitDescription));
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

      <div class="power-cost">
         <img src="../../assets/power_cost.webp" />
         <div class="cost">{{ cost }}</div>
      </div>

      <div class="desc_box">
         <div class="desc-shade" />
         <img
            src="../../assets/desc_box.webp"
            alt="description-image"
            title="description-image"
         />

         <div class="name">{{ name }}</div>

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

$card-border: 24px;
.card {
   /* container-type makes the card a query container, so every cqw unit
      below is relative to the CARD's width rather than the viewport.
      This ties all text directly to the card at any screen size. */
   container-type: inline-size;
   max-height: 100vh;
   aspect-ratio: 3/4;
   background: $glass;
   border: $glass-border;
   border-width: 3px;
   border-bottom-width: 6px;
   border-radius: $card-border;
   box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
   position: relative;
   backdrop-filter: $glass-blur;
   -webkit-backdrop-filter: $glass-blur;
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
         font-size: 6cqw;
      }
   }

   .desc_box {
      width: 100%;
      position: absolute;
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
            content: "";
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
         width: calc(100% - 14%);
         position: absolute;
         top: 8%;
         left: 7%;
         font-size: 3cqw;
         text-shadow: 0 0 5px black;
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
            font-size: calc(5cqw * var(--fit-scale, 1));
            line-height: 1.3;
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

      .strength,
      .durability {
         position: absolute;
         bottom: 30%;
         font-size: 6cqw;
         text-shadow: 0 0 5px black;
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
      bottom: 0.5%;
      font-size: 2cqw;
   }
}
</style>
