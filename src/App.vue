<script setup>
import { onMounted } from 'vue';
import { ModalsContainer } from 'vue-final-modal';
import Share from './components/Share/Share.vue';
import EditBar from './components/EditBar/EditBar.vue';
import Preview from './components/Preview/Preview.vue';
import Copyright from './components/Copyright.vue';
import { useCardStore } from './stores/card.store';
import { useShowcaseStore } from './stores/showcase.store';
import { applyParams } from './utils/serializeState';

const cardStore = useCardStore();
const showcaseStore = useShowcaseStore();

onMounted(() => {
   const params = new URLSearchParams(window.location.search);
   if (!params.size) return;
   applyParams(params, { cardStore, showcaseStore });
});
</script>

<template>
   <main id="root">
      <ModalsContainer />

      <div class="body">
         <Share />
         <EditBar />
         <Preview />
         <Copyright />
      </div>
   </main>
</template>

<style lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Smooch+Sans:wght@100..900&display=swap');

html {
   overflow: hidden;
}

:root {
   --popper-theme-background-color: rgba(15, 18, 28, 0.75);
   --popper-theme-background-color-hover: rgba(15, 18, 28, 0.75);
   --popper-theme-text-color: #ffffff;
   --popper-theme-border-width: 1px;
   --popper-theme-border-style: solid;
   --popper-theme-border-radius: 10px;
   --popper-theme-border-color: rgba(255, 255, 255, 0.1);
   --popper-theme-padding: 10px;
   --popper-theme-box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
}
</style>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

#root {
   height: 100vh;
   max-height: 100vh;
   width: 100%;
   max-width: 100%;
   background:
      radial-gradient(ellipse at top, rgba($blue, 0.6) 0%, transparent 55%),
      radial-gradient(
         ellipse at bottom right,
         rgba($red, 0.4) 0%,
         transparent 55%
      ),
      $bg-dark;
   font-family: 'Montserrat', sans-serif;
   font-optical-sizing: auto;
   color: white;
   overflow: hidden;

   .body {
      height: 100%;
      width: 100%;
      display: flex;
      padding: 10px;
      overflow: hidden;
   }
}
</style>
