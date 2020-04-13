import { Components } from "./types";
import { VueConstructor } from "vue";
import * as components from "./wf/index";
function install(Vue: VueConstructor) {
  // eslint-disable-next-line
  if ((install as any).installed) return;
  Object.keys(components).map((key: string) => {
    Vue.component(key, (components as Components)[key]);
  });
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...components
};
