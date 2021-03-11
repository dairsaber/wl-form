import { VueConstructor } from "vue";
import { Record } from "./types";
import components from "./wf";

function install(Vue: VueConstructor) {
  if ((install as any).installed) return;
  Object.keys(components).map((key: string) => {
    Vue.component(key, (components as Record<VueConstructor>)[key]);
  });
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...components
};
