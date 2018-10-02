import Vue from 'vue';
import App from './App.vue';
import router from './router';
import Vuetify from 'vuetify'
import store from './store';
import 'vue2-toast/lib/toast.css';
import Toast from 'vue2-toast';
import VueQriously from 'vue-qriously';
import VueQrcodeReader from 'vue-qrcode-reader';

Vue.use(Vuetify);
Vue.use(Toast, {
  defaultType: 'bottom',
  duration: 3000,
  wordWrap: true,
  width: '280px'
})
Vue.use(VueQriously)
Vue.use(VueQrcodeReader)

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  render: (h) => h(App),
}).$mount('#app');
