<script setup>
import { ref } from 'vue';
import { useToast } from 'vue-toast-notification';
import { BaseInput } from '../common';

const props = defineProps({
   urlName: { type: String, required: true },
   urlValue: { type: String, default: '' },
   localName: { type: String, required: true },
   localValue: { type: String, default: '' },
   placeholder: { type: String, default: 'Image URL' },
});

const emit = defineEmits(['input']);

const $toast = useToast();
const fileInput = ref(null);

const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8MB

const emitValue = (name, value) => emit('input', { target: { name, value } });

const handleUrlInput = ({ target: { value } }) => {
   /* typing a URL means the user wants that instead of the uploaded image */
   if (props.localValue) emitValue(props.localName, '');
   emitValue(props.urlName, value);
};

const handleFileChange = (e) => {
   const file = e.target.files?.[0];
   e.target.value = '';
   if (!file) return;

   if (!file.type.startsWith('image/')) {
      $toast.error('Please choose an image file.');
      return;
   }
   if (file.size > MAX_FILE_SIZE) {
      $toast.error('Image is too large (max 8MB).');
      return;
   }

   const reader = new FileReader();
   reader.onload = () => emitValue(props.localName, reader.result);
   reader.onerror = () => $toast.error('Failed to read image file.');
   reader.readAsDataURL(file);
};

const clearLocal = () => emitValue(props.localName, '');
</script>

<template>
   <div class="image-input">
      <div class="row">
         <BaseInput
            :name="urlName"
            :placeholder="placeholder"
            autocomplete="off"
            :value="urlValue"
            @input="handleUrlInput"
         />
         <button
            type="button"
            class="upload-btn"
            title="Upload an image from your computer"
            @click="fileInput?.click()"
         >
            Upload
         </button>
         <button
            v-if="localValue"
            type="button"
            class="clear-btn"
            title="Remove uploaded image"
            @click="clearLocal"
         >
            ×
         </button>
      </div>
      <p v-if="localValue" class="local-note">
         Using an uploaded image, stored on this device only. It will not be
         shared by link and will not be saved with the card.
      </p>
      <input
         ref="fileInput"
         type="file"
         accept="image/*"
         class="hidden-file-input"
         @change="handleFileChange"
      />
   </div>
</template>

<style lang="scss" scoped>
.image-input {
   .row {
      display: flex;
      gap: 6px;
      align-items: flex-start;

      :deep(input) {
         flex: 1;
         min-width: 0;
      }
   }

   .upload-btn,
   .clear-btn {
      flex-shrink: 0;
      background: transparent;
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      color: rgba(255, 255, 255, 0.6);
      font-size: 0.8rem;
      line-height: 1;
      padding: 0 10px;
      height: 34px;
      cursor: pointer;

      &:hover {
         background: rgba(255, 255, 255, 0.1);
         color: white;
      }
   }

   .clear-btn {
      font-size: 1rem;
      padding: 0 8px;
   }

   .local-note {
      margin: -4px 0 10px;
      font-size: 0.75rem;
      color: rgba(255, 180, 120, 0.85);
   }

   .hidden-file-input {
      display: none;
   }
}
</style>
