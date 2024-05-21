<script setup>
</script>

<template>
   <div class="copyright">
      <a href="https://silentarcticdev.github.com/customchrono" target="__blank">GitHub</a> |
      &copy;2024 SilentArcticDev
   </div>
</template>

<style lang="scss" scoped>
.copyright {
   position: absolute;
   right: 6px;
   bottom: 4px;
   font-size: 0.75rem;
   opacity: 0.5;

   a { color: cyan; }

   @media (max-width: $screen-sm) {
      top: 60px;
      bottom: auto;
      right: 10px;
   }
}
</style>
