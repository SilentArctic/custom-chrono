<script setup>
import { onMounted } from 'vue';
import { ModalsContainer } from 'vue-final-modal';
import Share from './components/Share/Share.vue';
import EditBar from './components/EditBar/EditBar.vue';
import Cards from './components/Cards/Cards.vue';
import Copyright from './components/Copyright.vue';
import { useCardStore } from './stores/card';

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

input {
   height: 34px;
   margin-bottom: 10px;

   &[type="range"] {
      width: 100%;
      -webkit-appearance: none;
      background: transparent !important;
      border: none;
      box-shadow: none;
      &::-ms-track {
         width: 100%;
         cursor: pointer;
         background: transparent;
         border-color: transparent;
         color: transparent;
      }
      &::-webkit-slider-thumb {
         background: green;
         margin-top: -4px;
      }
      &::-webkit-slider-runnable-track {
         width: 100%;
         height: 8px;
         cursor: pointer;
         background: rgba(0, 0, 0, 0.25);
         border-radius: 10px;
         border: 0.2px solid rgba(255, 255, 255, 0.1);;
      }
   }
}

input, textarea {
   width: 100%;
   background-color: rgba(0, 0, 0, 0.25);
   border: none;
   border-bottom: 4px solid rgba(255, 255, 255, 0.1);
   border-radius: 3px 3px 0 0;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
   padding: 0.3rem 0.5rem;
   color: white;
}

select {
   height: 34px;
   width: 100%;
   background-color: rgba(0, 0, 0, 0.25);
   border: none;
   border-bottom: 4px solid rgba(255, 255, 255, 0.1);
   border-radius: 3px 3px 0 0;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
   padding: 0.3rem 0.5rem;
   color: white;
   text-transform: capitalize;
   &:first-child { margin-bottom: 10px; }

   option {
      background: #0a1030;
   }
}

input, textarea, select {
   font-size: 0.9rem !important;
}

hr {
   margin: 1rem 0;
   border: 3px double rgba(#dec34f, 0.75);
   border-radius: 10px;
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

      @media (max-width: $screen-sm) {
         // width: 190%;
      }
   }
}
</style>
