<script setup>
import { VueFinalModal } from 'vue-final-modal';
import transformDescription from '@/utils/transformDescription';
import { BaseHr } from '../common';

defineEmits(['close']);
</script>

<template>
   <VueFinalModal
      class="modal"
      content-class="modal-content"
      overlay-transition="vfm-fade"
      content-transition="vfm-fade"
   >
      <article>
         <section>
            <h1 :style="{ margin: 0 }">Description Customizations</h1>
            <BaseHr />
            <p>Card descriptions often feature highlights and other text decoration to emphasize certain words. The following formats are allowed in a card's description.</p>
            <br />
            <p>
               <span v-html="transformDescription('[keyword]')" />:
               <span>Use [brackets] to highlight keywords.</span>
            </p>
            <p>
               <span v-html="transformDescription('*bold*')" />:
               <span>Use *asterisks* to bold words.</span>
            </p>
            <p>
               <span v-html="transformDescription('_italic_')" />:
               <span>Use _underscores_ to italicize words.</span>
            </p>
            <br />
            <img src="https://i.imgur.com/c8510Hx.png" />
         </section>

         <section>
            <h1>Art Sliders</h1>
            <BaseHr />
            <p>Slide the sliders to adjust image position (x/y), zoom (z), and rotation (r).</p>
            <p>Click on the numerical value to reset to 0, or increase by 90 if the current value is a multiple of 90.</p>
            <img src="https://i.imgur.com/a3TnzZP.png" />
         </section>

         <section>
            <h1>Sharing</h1>
            <BaseHr />
            <p>There are two ways to share your new card: the Share button and the Download button, found at the top of your screen.</p>
            <img src="https://i.imgur.com/IBLQsHZ.png" />

            <br />
            <h2>Share</h2>
            <p>Clicking the "Share" button will copy a URL to your clipboard. This can be pasted into anyone's browser and will load your card.</p>

            <br />
            <h2>Download</h2>
            <p>There are two options for download: <strong>SVG</strong> and <strong>PNG</strong>. <strong>SVGs</strong> are higher quality, but don't upload to social media as easily. <strong>PNGs</strong> can be directly uploaded to social media.</p>
            <p>When downloading an Agent you will receive and individual image for each card, as well as a "group photo" that includes both cards in one image.</p>
         </section>

         <section>
            <h1>Mobile Devices</h1>
            <BaseHr />
            <p>Custom Chrono works best on desktop, but does include support for mobile devices. When working with an Agent card, tap on either card to view the non-focused card.</p>
         </section>
      </article>
   </VueFinalModal>
</template>

<style lang="scss">
.modal {
   display: flex;
   justify-content: center;
   align-items: center;
   color: white;
   font-family: "Montserrat", sans-serif;

   .modal-content {
      display: flex;
      height: 75%;
      width: 75%;
      flex-direction: column;
      padding: 1rem;
      background: linear-gradient(to bottom right, $blue, $red);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      padding-bottom: 60px;
      box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
      overflow-y: auto;
      &::-webkit-scrollbar { width: 19px; }
      &::-webkit-scrollbar-track { background: transparent; }
      &::-webkit-scrollbar-thumb {
         background: rgba(255, 255, 255, 0.1);
         border: 6px solid transparent;
         border-radius: 10px;
         background-clip: padding-box;
      }

      & > * + *{
         margin: 0.5rem 0;
      }

      h1 {
         margin-top: 2rem;
         font-size: 1.375rem;
      }

      h2 {
         font-size: 1.2rem;
      }

      p + p {
         margin-top: 0.5rem;
      }

      hr {
         border-color: rgba(#dec34f, 0.75);
         margin: 0.5rem 0;
      }

      img {
         max-width: 600px;
         margin: 0.5rem auto 0;
         border: 1px solid rgba(255, 255, 255, 0.25);
         border-radius: 10px;
         box-shadow: 0 4px 30px rgba(0, 0, 0, 0.2);
      }

      button {
         margin: 0.25rem 0 0 auto;
         padding: 0 8px;
         border: 1px solid;
         border-radius: 0.5rem;
      }

      @media (max-width: $screen-sm) {
         height: 80%;
         width: calc(100% - 20px);

         img { max-width: 100%; }
      }
   }

   .dark .modal-content {
      background: #000;
   }
}
</style>
