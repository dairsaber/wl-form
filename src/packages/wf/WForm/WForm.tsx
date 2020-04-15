import { Vue, Prop } from "vue-property-decorator";
import moment, { Moment } from "moment";
import { VNode } from "vue";
import { Spin, Empty } from "ant-design-vue";
import { CreateElement } from "vue/types/umd";
export default class WForm extends Vue implements wform.FormController {
  @Prop({ type: Boolean })
  readonly loading: boolean = false;
  @Prop({ type: Function })
  readonly configFunc: wform.getFormConfig = () => ({});
  @Prop({ type: Object })
  readonly defaultValues: wform.CommonProp = {};
  @Prop({ type: Function, required: true })
  readonly createForm!: (form: wform.FormController) => void;
  @Prop({ type: Boolean })
  readonly disabled: boolean = false;

  private _formMap: { [key: string]: wform.FormItemInfo } = {};

  constructor() {
    super();
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

  getFormMap(): wform.CommonProp {
    return this._formMap;
  }
  async validate(key: string): Promise<boolean> {
    const currentFormItem = this._formMap[key];
    if (currentFormItem) {
      return await currentFormItem.methods.onValidate();
    }
    return false;
  }

  getValues(arr: string[]): wform.CommonProp {
    if (!arr) {
      arr = Object.keys(this._formMap);
    }
    return arr.reduce((prev: wform.CommonProp, current: string) => {
      return { ...prev, [current]: this.getValue(current) };
    }, {});
  }

  getValue(key: string): any {
    const currentFormItem = this._formMap[key];
    return currentFormItem
      ? getFormatValue(
          currentFormItem.config,
          currentFormItem.methods.getValue()
        )
      : undefined;
  }

  setValues<T extends wform.CommonProp = any>(obj: T): void {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this._formMap[x];
      if (currentFormItem) {
        const newValue = getFilterValue(currentFormItem.config, obj[x]);
        currentFormItem.methods.setValue(newValue);
      }
    });
  }

  clearValues(): boolean {
    Object.keys(this._formMap).forEach(x => {
      this._formMap[x].methods.setValue(undefined);
    });
    return true;
  }

  resetValues(): boolean {
    Object.keys(this._formMap).forEach(x => {
      this._formMap[x].methods.resetValue();
    });
    return true;
  }

  async getValueWithValidate(key: string): Promise<wform.FormItemValue<any>> {
    const currentFormItem = this._formMap[key];
    return currentFormItem.methods.getValueWithValidate();
  }

  async setValueWithValidate(key: string, value: any): Promise<boolean> {
    const currentFormItem = this._formMap[key];
    return currentFormItem.methods.setValueWithValidate(value);
  }
  //此方法放到异步栈中节省资源消耗 所以用async
  async setStatus(key: string, obj: wform.StatusMessage) {
    const currentFormItem = this._formMap[key];
    currentFormItem.methods.setStatusMessage(obj);
  }
  async submit<T>(): Promise<wform.FormValue<T>> {
    const keys = Object.keys(this._formMap);
    let hasError: boolean = false;
    let result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const currentFormItem = this._formMap[key];
      const {
        error,
        value
      } = await currentFormItem.methods.getValueWithValidate();
      if (!hasError && error) {
        hasError = true;
      }
      const currentValue = value[key];
      result = {
        ...result,
        [key]: getFormatValue(currentFormItem.config, currentValue)
      };
    }
    return { error: hasError, values: result as T };
  }

  getConfig(key: string): wform.FormConfigItem {
    const currentConfig = this.configFunc(this);
    const config: wform.FormConfigItem = currentConfig[key] || {};
    config.key = key;
    //初始值
    config.defaultValue = getFilterValue(config, this.defaultValues[key]);
    return config;
  }
  //设置默认值 并重置 表单值为当前默认值
  setDefaultValue(key: string, value: any) {
    const currentFormItem = this._formMap[key];
    currentFormItem && currentFormItem.methods.setDefaultValue(value);
  }
  delegate(formItemInfo: wform.FormItemInfo) {
    formItemInfo.methods.setDisabled(this.disabled);
    this._formMap[name] = formItemInfo;
  }
  render(h: CreateElement): VNode {
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
    // (
    //   <Spin style={{width:"100%",height:"100%"}}>
    //     {this.$scopedSlots.default && this.$scopedSlots.default}
    //   </Spin>
    // );
  }
}

const DATE_TYPES: wform.FormItemType[] = [
  wform.FormItemType.month,
  wform.FormItemType.date,
  wform.FormItemType.week
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
/**
 * 判断值是否是空
 * @param val 任意值
 */
function isNullOrUndefined(val: any) {
  return val === null || val === undefined;
}
