import Vue from "vue";
import App from "./App.vue";
import WlForm from "../packages/install";
import antd from "ant-design-vue";
Vue.config.productionTip = false;
Vue.use(WlForm);
Vue.use(antd);
new Vue({
  render: h => h(App)
}).$mount("#app");
