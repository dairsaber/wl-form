import Vue from "vue";
import App from "./App.vue";
import wf from "../packages/install";
Vue.use(wf);

Vue.config.productionTip = false;

new Vue({
  render: h => h(App)
}).$mount("#app");
