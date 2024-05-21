import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createVfm } from 'vue-final-modal';
import ToastPlugin from 'vue-toast-notification';
import App from './App.vue';
import './reset.css';
import 'vue-final-modal/style.css';
import 'vue-toast-notification/dist/theme-default.css';

const app = createApp(App);

app
   .use(createPinia())
   .use(createVfm())
   .use(ToastPlugin)
   .mount('#app');
