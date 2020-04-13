import { Vue, Component, Prop } from "vue-property-decorator";
import { VNode } from "vue";
import { getFormConfig, CommonProp } from "../../types";
export default class WFormItem extends Vue {
  @Prop({ type: Function })
  private getConfig?: getFormConfig;
  @Prop({ type: Object })
  private defaultValues: CommonProp = {};
  @Prop({ type: Function, required: true })
  private createForm!: (form: any) => any;
  render(): VNode | null {
    return <div style="width:100%;height:100%;">dadada</div>;
  }
}
