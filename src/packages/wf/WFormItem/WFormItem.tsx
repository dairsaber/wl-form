import { Vue, Component, Prop } from "vue-property-decorator";
import { VNode } from "vue";
import { getFormConfig, CommonProp } from "../../types";
export default class WFormItem extends Vue {
  @Prop({ type: Function })
  private getConfig?: getFormConfig;
  @Prop({ type: Object })
  private defaultValues: CommonProp = {};
  render(): VNode | null {
    return <div>dadada</div>;
  }
}
