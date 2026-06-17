import { computed } from 'vue';
import { useShowcaseStore } from '@/stores/showcase.store';

export function useBackgroundStyle() {
   const showcaseStore = useShowcaseStore();
   return computed(() => {
      const { x, y, z, r } = showcaseStore.backgroundPos;
      return {
         transform: `translate(${x / 5}%, ${y / 5}%) rotate(${r}deg)`,
         scale: 1 + z / 100,
      };
   });
}
