<script setup>
defineProps({ artCredit: String });
</script>

<template>
   <div class="credits">
      <div class="site">https://customchrono.netlify.app</div>
      <div v-if="artCredit" class="art">Art: {{ artCredit }}</div>
   </div>
</template>

<style lang="scss" scoped>
.credits {
   width: 100%;
   display: flex;
   justify-content: space-between;
   padding: 0 1%;
   position: absolute;
   bottom: 1%;
   z-index: 2;
   color: rgba(255, 255, 255, 0.6);
   font-size: var(--credits-font-size, clamp(0.55rem, 0.8vw, 0.6rem));
   text-shadow: 0 0 5px black;
}
</style>
