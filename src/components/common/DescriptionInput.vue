<script setup>
import { computed, nextTick, ref } from 'vue';
import * as Keywords from '@/constants/keywords.constants';
import * as Timelines from '@/constants/timelines.constants';
import { keywordIcon } from '@/utils/gameCard/assets';

const props = defineProps({
   name: { type: String, required: true },
   value: { type: String, default: '' },
   placeholder: { type: String, default: '' },
   rows: { type: [String, Number], default: 6 },
});

const emit = defineEmits(['input']);

const TRIGGERS = {
   '[': { items: Keywords.ALL, close: ']', label: 'Keywords' },
   $: { items: Timelines.ALL, close: '$', label: 'Timelines' },
};

const textarea = ref(null);
const suggestion = ref(null);
const highlighted = ref(0);

const matches = computed(() => {
   if (!suggestion.value) return [];
   const query = suggestion.value.query.toLowerCase();
   return TRIGGERS[suggestion.value.trigger].items.filter((item) =>
      item.toLowerCase().startsWith(query),
   );
});

const detect = () => {
   const el = textarea.value;
   if (!el) return null;
   const caret = el.selectionStart;
   const before = el.value.slice(0, caret);

   let best = null;
   Object.keys(TRIGGERS).forEach((trigger) => {
      const start = before.lastIndexOf(trigger);
      if (start < 0) return;
      const query = before.slice(start + 1);
      if (/[\n[\]{}$]/.test(query)) return;
      const opened = before.slice(0, start).split(trigger).length - 1;
      if (trigger === '$' && opened % 2 === 1) return;
      if (!best || start > best.start) best = { trigger, start, query, caret };
   });
   return best;
};

const refresh = () => {
   const next = detect();
   const same =
      next &&
      suggestion.value &&
      next.trigger === suggestion.value.trigger &&
      next.start === suggestion.value.start;
   suggestion.value = next;
   if (!same) highlighted.value = 0;
};

const onInput = (event) => {
   emit('input', { target: { name: props.name, value: event.target.value } });
   refresh();
};

const close = () => {
   suggestion.value = null;
};

const pick = async (item) => {
   const el = textarea.value;
   const { trigger, start, caret } = suggestion.value;
   const inserted = `${trigger}${item}${TRIGGERS[trigger].close}`;
   const value = el.value.slice(0, start) + inserted + el.value.slice(caret);
   close();
   emit('input', { target: { name: props.name, value } });
   await nextTick();
   el.value = value;
   const position = start + inserted.length;
   el.setSelectionRange(position, position);
   el.focus();
};

const onKeydown = (event) => {
   if (!suggestion.value || !matches.value.length) return;

   const count = matches.value.length;
   if (event.key === 'ArrowDown') {
      highlighted.value = (highlighted.value + 1) % count;
   } else if (event.key === 'ArrowUp') {
      highlighted.value = (highlighted.value - 1 + count) % count;
   } else if (event.key === 'Enter' || event.key === 'Tab') {
      pick(matches.value[Math.min(highlighted.value, count - 1)]);
   } else if (event.key === 'Escape') {
      close();
   } else {
      return;
   }
   event.preventDefault();
};
</script>

<template>
   <div class="description-input">
      <textarea
         ref="textarea"
         :name="name"
         :value="value"
         :placeholder="placeholder"
         :rows="rows"
         @input="onInput"
         @keydown="onKeydown"
         @click="refresh"
         @keyup.left.right="refresh"
         @blur="close"
      />
      <ul v-if="suggestion && matches.length" class="suggestions">
         <li class="title">{{ TRIGGERS[suggestion.trigger].label }}</li>
         <li
            v-for="(item, index) in matches"
            :key="item"
            :class="{ highlighted: index === highlighted }"
            @mousedown.prevent="pick(item)"
            @mousemove="highlighted = index"
         >
            <span
               v-if="suggestion.trigger === '[' && keywordIcon(item)"
               class="icon"
               :style="{
                  '--icon': `url(${keywordIcon(item).url})`,
                  '--icon-color': keywordIcon(item).color,
               }"
            />
            <span v-else class="icon" />
            {{ item }}
         </li>
      </ul>
   </div>
</template>

<style lang="scss" scoped>
.description-input {
   position: relative;
   width: 100%;

   textarea {
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

   .suggestions {
      position: absolute;
      left: 0;
      right: 0;
      top: 100%;
      z-index: 20;
      margin: 0;
      padding: 0.25rem 0;
      list-style: none;
      max-height: 220px;
      overflow-y: auto;
      background: rgba(15, 18, 28, 0.97);
      border: $glass-border;
      border-radius: 0 0 6px 6px;
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
      font-size: 0.9rem;

      li {
         display: flex;
         align-items: center;
         gap: 0.5rem;
         padding: 0.3rem 0.6rem;
         cursor: pointer;
         color: white;

         .icon {
            width: 1.1rem;
            height: 1.1rem;
            flex: none;
            background-color: var(--icon-color, transparent);
            -webkit-mask: var(--icon, none) center / contain no-repeat;
            mask: var(--icon, none) center / contain no-repeat;
         }

         &.title {
            cursor: default;
            font-size: 0.7rem;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: rgba(255, 255, 255, 0.45);
         }

         &.highlighted {
            background: rgba(246, 210, 89, 0.15);
            color: $gold;
         }
      }
   }
}
</style>
