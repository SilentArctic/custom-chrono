<script setup>
import {
   computed,
   ref,
   watch,
   watchEffect,
   onMounted,
   onBeforeUnmount,
} from 'vue';
import VanillaTilt from 'vanilla-tilt';
import * as CardTypes from '@/constants/creatorTypes';
import { getFrameKind, renderGameCard } from '@/utils/gameCard/renderer';
import {
   CANVAS_LEFT,
   CANVAS_TOP,
   CANVAS_WIDTH,
   frameBody,
   frameBounds,
} from '@/utils/gameCard/layout';
import PreviewCredits from '../PreviewCredits.vue';

const props = defineProps({
   cardType: {
      type: String,
      required: true,
      validator: (val) => Object.values(CardTypes).includes(val),
   },
   name: { type: String, required: true },
   art: { type: String, required: true },
   artLocal: { type: String, default: '' },
   artCredit: { type: String, required: true },
   artPos: { type: Object, required: true },
   cost: { type: Number, required: true },
   description: { type: String, required: true },
   syndicate: { type: String, required: true },
   strength: { type: Number },
   durability: { type: Number },
   actionSpeed: { type: String, default: 'immediate' },
   rarity: { type: String, default: 'common' },
   immortalized: { type: Boolean, default: false },
   resolution: { type: Number, default: 10 },
});

const resolvedArt = computed(() => props.artLocal || props.art);
const artImage = ref(null);

const loadImage = (src, crossOrigin) =>
   new Promise((resolve, reject) => {
      const image = new Image();
      if (crossOrigin) image.crossOrigin = 'anonymous';
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = src;
   });

let artRequest = 0;
watch(
   resolvedArt,
   (src) => {
      artRequest += 1;
      const request = artRequest;
      if (!src) {
         artImage.value = null;
         return;
      }
      loadImage(src, true)
         .catch(() => loadImage(src, false))
         .then(
            (image) => {
               if (request === artRequest) artImage.value = image;
            },
            () => {
               if (request === artRequest) artImage.value = null;
            },
         );
   },
   { immediate: true },
);

const model = computed(() => ({
   cardType: props.cardType,
   immortalized: props.immortalized,
   name: props.name,
   art: artImage.value,
   artPos: {
      x: props.artPos?.x ?? 0,
      y: props.artPos?.y ?? 0,
      z: props.artPos?.z ?? 0,
      r: props.artPos?.r ?? 0,
   },
   cost: props.cost,
   description: props.description,
   syndicate: props.syndicate,
   strength: props.strength,
   durability: props.durability,
   actionSpeed: props.actionSpeed,
   rarity: props.rarity,
}));

const bounds = computed(() => frameBounds(getFrameKind(model.value)));
const body = computed(() => frameBody(getFrameKind(model.value)));

const cardStyle = computed(() => ({
   aspectRatio: `${bounds.value.w} / ${bounds.value.h}`,
}));

const canvasStyle = computed(() => {
   const { x, y, w, h } = bounds.value;
   return {
      width: `${(CANVAS_WIDTH / w) * 100}%`,
      left: `${((CANVAS_LEFT - x) / w) * 100}%`,
      top: `${((y + h - CANVAS_TOP) / h) * 100}%`,
   };
});

const glassStyle = computed(() => {
   const { x, y, w, h } = bounds.value;
   const { x: bx, y: by, w: bw, h: bh, r } = body.value;
   return {
      left: `${((bx - x) / w) * 100}%`,
      top: `${((y + h - (by + bh)) / h) * 100}%`,
      width: `${(bw / w) * 100}%`,
      height: `${(bh / h) * 100}%`,
      borderRadius: `${(r / bw) * 100}% / ${(r / bh) * 100}%`,
   };
});

const canvasRef = ref(null);
const renderCache = {};
let pendingFrame = 0;
let rendering = false;
let dirty = false;

const draw = async () => {
   pendingFrame = 0;
   if (!canvasRef.value) return;
   if (rendering) {
      dirty = true;
      return;
   }
   rendering = true;
   try {
      await renderGameCard(canvasRef.value, model.value, {
         pixelsPerUnit: props.resolution,
         cache: renderCache,
      });
   } catch (error) {
      console.error(error);
   } finally {
      rendering = false;
      if (dirty) {
         dirty = false;
         schedule();
      }
   }
};

const schedule = () => {
   if (!pendingFrame) pendingFrame = requestAnimationFrame(draw);
};

watch(model, schedule);
onMounted(schedule);
onBeforeUnmount(() => cancelAnimationFrame(pendingFrame));

const cardRef = ref(null);
watchEffect(() => {
   if (!cardRef.value) return;
   VanillaTilt.init(cardRef.value, { max: 4 });
});
</script>

<template>
   <div ref="cardRef" class="card" :style="cardStyle">
      <div class="card-glass" :style="glassStyle" />
      <canvas ref="canvasRef" class="card-canvas" :style="canvasStyle" />
      <PreviewCredits :artCredit="artCredit" />
   </div>
</template>

<style lang="scss" scoped>
.card {
   /* container-type makes the card a query container, so every cqw unit
      below is relative to the CARD's width rather than the viewport. */
   container-type: inline-size;
   max-height: 100vh;

   @media (max-width: $screen-sm) {
      /* 80vh = top of the EditBar strip; 120px = 10px body padding + 100px
         cards padding-top + 10px gap so the card clears the EditBar */
      max-height: calc(80vh - 120px);
   }
   aspect-ratio: 960 / 1288;
   position: relative;
   font-family: 'Barlow Condensed', sans-serif;
   letter-spacing: 7.5%;
   text-shadow:
      -1px -1px 0 #000,
      1px -1px 0 #000,
      -1px 1px 0 #000,
      1px 1px 0 #000;

   /* glass sits behind the frame body only, so the gems overhang it */
   .card-glass {
      position: absolute;
      background: $glass;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
      backdrop-filter: $glass-blur;
      -webkit-backdrop-filter: $glass-blur;
   }

   .card-canvas {
      display: block;
      position: absolute;
      height: auto;
      aspect-ratio: 164 / 226;
   }

   .credits {
      width: 100%;
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0 1.5em;
      padding: 0 14%;
      position: absolute;
      bottom: 8%;
      font-size: 2cqw;
      line-height: 1.2;
      text-align: center;
   }
}
</style>
