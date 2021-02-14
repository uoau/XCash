import Vue from 'vue';
import allMine from '../../all-mine/packages/index';
import App from './index.vue';
// import '../../all-mine/packages/stylesheet/index.css';

Vue.use(allMine);

new Vue({
    render: (h) => h(App),
}).$mount('#app');
