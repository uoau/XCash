import Vue from 'vue';
import allMine from 'all-mine';
import App from './index.vue';
import 'all-mine/lib/index.css';

Vue.use(allMine);

new Vue({
    render: (h) => h(App),
}).$mount('#app');
