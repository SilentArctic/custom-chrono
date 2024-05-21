<script setup>
defineProps({
   textarea: { type: Boolean, default: false },
});
</script>

<template>
   <textarea v-if="textarea" v-bind="$attrs" />
   <input v-else v-bind="$attrs"/>
</template>

<style lang="scss" scoped>
input, textarea {
   width: 100%;
   background-color: rgba(0, 0, 0, 0.25);
   border: none;
   border-bottom: 4px solid rgba(255, 255, 255, 0.1);
   border-radius: 3px 3px 0 0;
   box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
   padding: 0.3rem 0.5rem;
   color: white;
   font-size: 0.9rem !important;
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
</style>
