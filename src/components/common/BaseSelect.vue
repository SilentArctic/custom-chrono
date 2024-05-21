<template>
   <select v-bind="$attrs">
      <slot />
   </select>
</template>

<style lang="scss" scoped>
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
   font-size: 0.9rem !important;
   &:first-child { margin-bottom: 10px; }

   :deep(option) {
      background-color: #0a1030;
   }
}
</style>
