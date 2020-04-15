import { VueConstructor } from "vue";
import * as components from "./wf/index";
// import { common } from 'types/common'
function install(Vue: VueConstructor) {
  // eslint-disable-next-line
  if ((install as any).installed) return;
  Object.keys(components).map((key: string) => {
    Vue.component(key, (components as common.Components )[key]);
  });
}

if (typeof window !== "undefined" && window.Vue) {
  install(window.Vue);
}

export default {
  install,
  ...components
};
