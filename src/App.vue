<script setup>
import { onMounted } from 'vue';
import { ModalsContainer } from 'vue-final-modal';
import Share from './components/Share/Share.vue';
import EditBar from './components/EditBar/EditBar.vue';
import Cards from './components/Cards/Cards.vue';
import Copyright from './components/Copyright.vue';
import { useCardStore } from './stores/card.store';

const cardStore = useCardStore();

onMounted(() => {
   const params = new URLSearchParams(window.location.search);
   cardStore.setFromParams(params);
});
</script>

<template>
   <main id="root">
      <ModalsContainer />

      <div class="body">
         <Share />
         <EditBar />
         <Cards />
         <Copyright />
      </div>
   </main>
</template>

<style lang="scss">
html {
   overflow: hidden;
}

:root {
   --popper-theme-background-color: #{$blue};
   --popper-theme-background-color-hover: #{$blue};
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
@import url('https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100..900;1,100..900&display=swap');

#root {
   height: 100vh;
   max-height: 100vh;
   width: 100%;
   max-width: 100%;
   background: linear-gradient(to bottom right, $blue, $red);
   font-family: "Montserrat", sans-serif;
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
