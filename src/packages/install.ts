import { VueConstructor } from "vue";
import components from "./wf";

function install(Vue: VueConstructor) {
  if ((install as any).installed) return;
  Object.keys(components).map((key: string) => {
    Vue.component(key, (components as common.Components)[key]);
  });
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...components
};
