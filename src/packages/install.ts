import { VueConstructor } from "vue";
import * as components from "./wf";
import { Components } from "./types/common";
function install(Vue: VueConstructor) {
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
