import { useShowcaseStore } from '@/stores/showcase.store';

export function useShowcaseHandlers() {
   const showcaseStore = useShowcaseStore();
   const handleValue = ({ target: { name, value } }) => showcaseStore.setValue(name, value);
   const handleRange = ({ target: { name, value } }) => showcaseStore.setBackgroundPos(name, value);
   return { showcaseStore, handleValue, handleRange };
}
