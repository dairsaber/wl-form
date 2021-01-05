import Vue from "vue";
import App from "./App.vue";
import WlForm from "../packages/install";
Vue.config.productionTip = false;
Vue.use(WlForm);
new Vue({
  render: h => h(App)
}).$mount("#app");
