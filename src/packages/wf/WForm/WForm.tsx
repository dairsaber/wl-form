import { Vue, Component, Prop } from "vue-property-decorator";
import moment, { Moment } from "moment";
import { VNode } from "vue";
import { Spin, Empty } from "ant-design-vue";
import { CreateElement } from "vue/types/umd";
import {
  FormController,
  getFormConfig,
  CommonProp,
  FormItemInfo,
  FormItemValue,
  StatusMessage,
  FormValue,
  FormConfigItem,
  FormItemType
} from "@/packages/types/wform";
/**
 * 判断值是否是空
 * @param val 任意值
 */
function isNullOrUndefined(val: any) {
  return val === null || val === undefined;
}
const DATE_TYPES: FormItemType[] = [
  FormItemType.month,
  FormItemType.date,
  FormItemType.week
];
function getFilterValue<T = any>(config: FormConfigItem, value: T): T | Moment {
  const { filterFunc, type } = config;
  if (filterFunc) {
    return filterFunc<T>(value);
  }
  if (!isNullOrUndefined(value) && DATE_TYPES.includes(type)) {
    return moment(value);
  } else {
    return value;
  }
}
function getFormatValue(config: FormConfigItem, value: any): any {
  const { formatFunc, type, childProps } = config;
  if (formatFunc) {
    return formatFunc(value);
  }
  if (!isNullOrUndefined(value) && DATE_TYPES.includes(type)) {
    const { format } = childProps || {}; //这边format是一个参数告诉date如何 format
    if (format) {
      return (value as Moment).format(format);
    } else {
      return (value as Moment).format();
    }
  } else {
    return value;
  }
}
@Component
export default class WForm extends Vue implements FormController {
  @Prop({ type: Boolean, default: false })
  readonly loading!: boolean;
  @Prop({ type: Function })
  readonly configFunc!: getFormConfig;
  @Prop({ type: Object, default: () => ({}) })
  readonly defaultValues!: CommonProp;
  @Prop({ type: Function, required: true })
  readonly createForm!: (form: FormController) => void;
  @Prop({ type: Boolean, default: false })
  readonly disabled!: boolean;

  protected formMap: { [key: string]: FormItemInfo } = {};

  protected created() {
    this.createForm({
      submit: this.submit,
      getFormMap: this.getFormMap,
      setValues: this.setValues,
      clearValues: this.clearValues,
      resetValues: this.resetValues,
      getValue: this.getValue,
      getValues: this.getValues,
      setStatus: this.setStatus,
      setDefaultValue: this.setDefaultValue,
      getValueWithValidate: this.getValueWithValidate,
      setValueWithValidate: this.setValueWithValidate
    });
  }

  getFormMap(): CommonProp {
    return this.formMap;
  }
  async validate(key: string): Promise<boolean> {
    const currentFormItem = this.formMap[key];
    if (currentFormItem) {
      return await currentFormItem.methods.onValidate();
    }
    return false;
  }

  getValues(arr: string[]): CommonProp {
    if (!arr) {
      arr = Object.keys(this.formMap);
    }
    return arr.reduce((prev: CommonProp, current: string) => {
      return { ...prev, [current]: this.getValue(current) };
    }, {});
  }

  getValue(key: string): any {
    const currentFormItem = this.formMap[key];
    return currentFormItem
      ? getFormatValue(
          currentFormItem.config,
          currentFormItem.methods.getValue()
        )
      : undefined;
  }

  setValues<T extends CommonProp = any>(obj: T): void {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this.formMap[x];
      if (currentFormItem) {
        const newValue = getFilterValue(currentFormItem.config, obj[x]);
        currentFormItem.methods.setValue(newValue);
      }
    });
  }

  clearValues(): boolean {
    Object.keys(this.formMap).forEach(x => {
      this.formMap[x].methods.setValue(undefined);
    });
    return true;
  }

  resetValues(): boolean {
    Object.keys(this.formMap).forEach(x => {
      this.formMap[x].methods.resetValue();
    });
    return true;
  }

  async getValueWithValidate(key: string): Promise<FormItemValue<any>> {
    const currentFormItem = this.formMap[key];
    return currentFormItem.methods.getValueWithValidate();
  }

  async setValueWithValidate(key: string, value: any): Promise<boolean> {
    const currentFormItem = this.formMap[key];
    return currentFormItem.methods.setValueWithValidate(value);
  }
  //此方法放到异步栈中节省资源消耗 所以用async
  async setStatus(key: string, obj: StatusMessage) {
    const currentFormItem = this.formMap[key];
    currentFormItem.methods.setStatusMessage(obj);
  }
  async submit<T>(): Promise<FormValue<T>> {
    const keys = Object.keys(this.formMap);
    let hasError = false;
    let result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const currentFormItem = this.formMap[key];
      const { error, value } = await this.getValueWithValidate(key);
      if (!hasError && error) {
        hasError = true;
      }
      const currentValue = value;
      result = {
        ...result,
        [key]: getFormatValue(currentFormItem.config, currentValue)
      };
    }
    return { error: hasError, values: result as T };
  }

  getConfig(key: string): FormConfigItem {
    const currentConfig = this.configFunc(this);
    const config: FormConfigItem = currentConfig[key] || {};
    config.key = key;
    //初始值
    config.defaultValue = getFilterValue(config, this.defaultValues[key]);
    return config;
  }
  //设置默认值 并重置 表单值为当前默认值
  setDefaultValue(key: string, value: any) {
    const currentFormItem = this.formMap[key];
    currentFormItem && currentFormItem.methods.setDefaultValue(value);
  }
  delegate(formItemInfo: FormItemInfo) {
    formItemInfo.methods.setDisabled(this.disabled);
    const key = formItemInfo.config.key;
    if (key) {
      this.formMap[key] = formItemInfo;
    }
  }
  protected render(h: CreateElement): VNode {
    return h(
      Spin,
      {
        style: {
          width: "100%",
          height: "100%"
        },
        props: {
          spinning: this.loading,
          tip: "表单数据加载中...."
        }
      },
      [
        this.$scopedSlots.default
          ? this.$scopedSlots.default({
              getConfig: this.getConfig,
              delegate: this.delegate
            })
          : h(Empty, {
              props: {
                description: "暂未配置表单控件"
              }
            })
      ]
    );
  }
}
