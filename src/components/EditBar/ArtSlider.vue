<script setup>
const emit = defineEmits(['handleRange']);

const props = defineProps({
   label: { type: String, required: true },
   value: { type: Number, required: true },
});

const handleValueClick = () => {
   let newValue = 0;
   if (props.value % 90 > 0) newValue = 0;
   else {
      newValue = props.value === 0 ? 90
         : props.value === 90 ? 180
         : props.value === 180 ? -90
         : props.value === -90 && 0;
   }
   emit('handleRange', { target: { name: props.label, value: newValue } });
};
</script>

<template>
   <div class="img-slider">
      <span>{{ label }}</span>
      <input
         type="range"
         :value="value"
         :name="label"
         min="-200"
         max="200"
         @input="$emit('handleRange', $event)"
      />
      <span @click="handleValueClick">{{ value }}</span>
   </div>
</template>

<style lang="scss" scoped>
.img-slider {
   height: 30px;
   display: flex;
   align-items: center;

   input[type="range"] {
      margin: 0 5px;
   }

   span {
      width: 24px;
      min-width: 24px;
      max-width: 24px;
      text-align: center;
      cursor: pointer;
   }
}
</style>
