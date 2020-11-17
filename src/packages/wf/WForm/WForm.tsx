import { Vue, Component, Prop, Provide } from "vue-property-decorator";
import moment, { Moment } from "moment";
import { VNode } from "vue";
import { Spin, Empty } from "ant-design-vue";
import { CreateElement } from "vue/types/umd";
import { FormItemType } from "../types/wf-types";
/**
 * 判断值是否是空
 * @param val 任意值
 */
function isNullOrUndefined(val: any) {
  return val === null || val === undefined;
}
const DATE_TYPES: wform.FormItemType[] = [
  FormItemType.month,
  FormItemType.date,
  FormItemType.week
];
function getFilterValue<T = any>(
  config: wform.FormConfigItem,
  value: T
): T | Moment {
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
function getFormatValue(config: wform.FormConfigItem, value: any): any {
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
export default class WForm extends Vue implements wform.FormController {
  @Prop({ type: Boolean, default: false })
  readonly loading!: boolean;
  @Prop({ type: Function })
  readonly configFunc!: wform.getFormConfig;
  @Prop({ type: Object, default: () => ({}) })
  readonly defaultValues!: wform.CommonProp;
  @Prop({ type: Function, required: true })
  readonly createForm!: (form: wform.FormController) => void;
  @Prop({ type: Boolean, default: false })
  readonly disabled!: boolean;
  private myFormData: { [key: string]: any } = {
    ...(this.defaultValues || {})
  };
  private myDefaultFormData: { [key: string]: any } = {
    ...(this.defaultValues || {})
  };
  @Provide() private rootComp: any = this;
  @Provide() private setDefaultFormData = (
    obj: { [key: string]: any } = {}
  ) => {
    Object.entries(obj).forEach(([key, value]) => {
      this.myDefaultFormData[key] = value;
    });
  };
  @Provide() private setFormData = (obj: { [key: string]: any } = {}) => {
    Object.entries(obj).forEach(([key, value]) => {
      this.myFormData[key] = value;
    });
  };

  protected formMap: { [key: string]: wform.FormItemInfo } = {};

  protected created() {
    this.createForm({
      submit: this.submit,
      getFormMap: this.getFormMap,
      clearValues: this.clearValues,
      resetValues: this.resetValues,
      getValue: this.getValue,
      getValues: this.getValues,
      setValues: this.setValues,
      setStatus: this.setStatus,
      setDefaultValue: this.setDefaultValue,
      validate: this.validate,
      setValuesWithValidate: this.setValuesWithValidate,
      getValueWithValidate: this.getValueWithValidate,
      setValueWithValidate: this.setValueWithValidate,
      setDisabled: this.setDisabled,
      disableAll: this.disableAll,
      enableAll: this.enableAll,
      setOptions: this.setOptions,
      hide: this.hide
    });
  }
  //隐藏控件
  hide(obj: { [key: string]: boolean }) {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this.formMap[x];
      if (currentFormItem) {
        currentFormItem.methods.hide(obj[x]);
      }
    });
  }
  //设置下拉选项 或者 有下拉选项的 options
  setOptions(obj: { [key: string]: any[] }) {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this.formMap[x];
      if (currentFormItem) {
        currentFormItem.methods.setOptions(obj[x]);
      }
    });
  }
  //获得表单控件操作对象数组
  getFormMap(): wform.CommonProp {
    return this.formMap;
  }
  //获取表单值  arr 不传则获取全部
  getValues(keys?: string[]): wform.CommonProp {
    if (!keys) {
      keys = Object.keys(this.formMap);
    }
    return keys.reduce((prev: wform.CommonProp, current: string) => {
      return { ...prev, [current]: this.getValue(current) };
    }, {});
  }
  // 获取单个值
  getValue(key: string): any {
    const currentFormItem = this.formMap[key];
    return currentFormItem
      ? getFormatValue(
          currentFormItem.config,
          currentFormItem.methods.getValue()
        )
      : undefined;
  }
  //设置值
  setValues<T extends wform.CommonProp = any>(obj: T): void {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this.formMap[x];
      if (currentFormItem) {
        const newValue = getFilterValue(currentFormItem.config, obj[x]);
        this.setFormData({ [x]: newValue });
        currentFormItem.methods.setValue(newValue);
      }
    });
  }
  disableAll() {
    Object.values(this.formMap).forEach(formItem => {
      formItem.methods.setDisabled(true);
    });
  }
  enableAll() {
    Object.values(this.formMap).forEach(formItem => {
      formItem.methods.setDisabled(false);
    });
  }
  //设置值并校验
  setValuesWithValidate<T extends wform.CommonProp = any>(obj: T): void {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this.formMap[x];
      if (currentFormItem) {
        const newValue = getFilterValue(currentFormItem.config, obj[x]);
        this.setFormData({ [x]: newValue });
        currentFormItem.methods.setValueWithValidate(newValue);
      }
    });
  }
  // 单个设置值
  setValue<T = any>(key: string, value: T) {
    const currentFormItem = this.formMap[key];
    if (currentFormItem) {
      const newValue = getFilterValue(currentFormItem.config, value);
      this.setFormData({ [key]: newValue });
      currentFormItem.methods.setValue(newValue);
    }
  }
  // 单个设置值并校验
  async setValueWithValidate(key: string, value: any): Promise<boolean> {
    const currentFormItem = this.formMap[key];
    if (currentFormItem) {
      const newValue = getFilterValue(currentFormItem.config, value);
      this.setFormData({ [key]: newValue });
      return await currentFormItem.methods.setValueWithValidate(newValue);
    }
    return false;
  }
  // 校验若不传key 则校验全部
  async validate(key?: string): Promise<boolean> {
    let validateKeys = Object.keys(this.formMap);
    if (key) {
      validateKeys = [key];
    }
    let hasError = false;
    for (let i = 0; i < validateKeys.length; i++) {
      const currentItem = this.formMap[validateKeys[i]];
      if (currentItem) {
        const validate = await currentItem.methods.onValidate();
        if (!hasError && !validate) {
          hasError = true;
        }
      }
    }
    return hasError;
  }
  //清除值
  clearValues(): boolean {
    Object.keys(this.formMap).forEach(x => {
      this.myFormData[x] = undefined;
      this.formMap[x].methods.setValue(undefined);
    });
    return true;
  }
  //重置表单值为默认值
  resetValues(): boolean {
    Object.keys(this.formMap).forEach(x => {
      this.myFormData[x] = this.myDefaultFormData[x];
      this.formMap[x].methods.resetValue();
    });
    return true;
  }
  //获取值并交验 他会返回原始值 不会format 注意
  async getValueWithValidate(key: string): Promise<wform.FormItemValue<any>> {
    const currentFormItem = this.formMap[key];
    return currentFormItem.methods.getValueWithValidate();
  }
  //此方法放到异步栈中节省资源消耗 所以用async
  async setStatus(key: string, obj: wform.StatusMessage, permanent?: boolean) {
    const currentFormItem = this.formMap[key];
    currentFormItem.methods.setStatusMessage(obj, permanent);
  }
  // 提交并获取表单所以字段的值 并校验
  async submit<T>(): Promise<wform.FormValue<T>> {
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

  getConfig(key: string): wform.FormConfigItem {
    const currentConfig = this.configFunc(this);
    const config: wform.FormConfigItem = currentConfig[key];
    config.key = key;
    //初始值
    config.defaultValue = getFilterValue(config, this.defaultValues[key]);
    return config;
  }
  //设置默认值 并重置 表单值为当前默认值
  setDefaultValue(key: string, value: any) {
    const currentFormItem = this.formMap[key];
    this.setDefaultFormData({ [key]: value });
    this.setFormData({ [key]: value });
    currentFormItem && currentFormItem.methods.setDefaultValue(value);
  }
  setDisabled(obj: { [key: string]: boolean } = {}) {
    Object.keys(obj).forEach(key => {
      const currentFormItem = this.formMap[key];
      currentFormItem && currentFormItem.methods.setDisabled(obj[key]);
    });
  }
  delegate(formItemInfo: wform.FormItemInfo) {
    if (this.disabled) {
      formItemInfo.methods.setDisabled(this.disabled);
    }
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
