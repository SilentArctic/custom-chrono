<script setup></script>

<template>
   <div class="copyright">
      <a href="https://github.com/SilentArctic/custom-chrono" target="__blank">
         GitHub
      </a>
      <span class="divider">·</span>
      <span>&copy;2026 SilentArctic</span>
   </div>
</template>

<style lang="scss" scoped>
.copyright {
   position: absolute;
   right: 8px;
   bottom: 5px;
   display: flex;
   align-items: center;
   gap: 5px;
   font-size: 0.7rem;
   letter-spacing: 0.04em;
   opacity: 0.45;
   text-shadow: 0 1px 4px rgba(0, 0, 0, 0.6);
   transition: opacity 0.2s;

   &:hover {
      opacity: 0.75;
   }

   a {
      color: #7ecfcf;
      text-decoration: none;

      &:hover {
         color: #aee8e8;
         text-decoration: underline;
      }
   }

   .divider {
      opacity: 0.5;
   }

   @media (max-width: $screen-sm) {
      top: 60px;
      bottom: auto;
      right: 10px;
   }
}
</style>
