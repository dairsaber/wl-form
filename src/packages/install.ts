import { VueConstructor } from "vue";
import * as components from "./wf/index";
const install: any = function(Vue: VueConstructor) {
  if (install.installed) return;
  Object.keys(components).map((key: string) => {
    Vue.component(key, (components as any)[key]);
  });
};

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...components
};
