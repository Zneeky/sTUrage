import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { Quasar, Notify, Dialog, Loading } from 'quasar';
import '@quasar/extras/material-icons/material-icons.css';
import 'quasar/src/css/index.sass';
import './css/app.scss';
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(Quasar, {
  plugins: { Notify, Dialog, Loading },
  config: {
    brand: {
      primary:   '#1565C0',
      secondary: '#0288D1',
      accent:    '#00ACC1',
      dark:      '#1A2035',
      positive:  '#2E7D32',
      negative:  '#C62828',
      warning:   '#EF6C00',
      info:      '#0277BD',
    },
    notify: { position: 'top-right', timeout: 3000 },
  },
});
app.mount('#app');
