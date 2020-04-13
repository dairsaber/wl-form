import { Vue, Component, Prop } from "vue-property-decorator";
import moment, { Moment } from "moment";
import { VNode } from "vue";
import {
  getFormConfig,
  CommonProp,
  FormController,
  FormValue,
  FormConfigItem
} from "../../types";
export default class WFormItem extends Vue {
  @Prop({ type: Function })
  private configFunc: getFormConfig = () => ({});
  @Prop({ type: Object })
  private defaultValues: CommonProp = {};
  @Prop({ type: Function, required: true })
  private createForm!: (form: FormController) => void;
  private formMap: CommonProp = {};

  getFormMap(): CommonProp {
    return this.formMap;
  }
  validate(key: string) {
    const currentFormItem = this.formMap[key];
    if (currentFormItem) {
      currentFormItem.onValidate();
    }
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
    if (currentFormItem) {
      const value = getFormatValue(
        currentFormItem.config,
        currentFormItem.getValueWithoutValidate()
      );
      return value;
    }
  }

  setValues(obj: CommonProp): void {
    const keys = Object.keys(obj || {});
    keys.forEach(x => {
      const currentFormItem = this.formMap[x];
      if (currentFormItem) {
        const newValue = setFormatValue(currentFormItem.config, obj[x]);
        currentFormItem.setValue(newValue);
      }
    });
  }

  clearValues(): boolean {
    Object.keys(this.formMap).forEach(x => {
      this.formMap[x].setValue(undefined);
    });
    return true;
  }

  resetValues(): boolean {
    Object.keys(this.formMap).forEach(x => {
      this.formMap[x].resetValue();
    });
    return true;
  }

  async getValueWithValidate(key: string): Promise<any> {
    const currentFormItem = this.formMap[key];
    return await currentFormItem.getValue();
  }

  async submit<T>(): Promise<FormValue<T>> {
    const keys = Object.keys(this.formMap);
    let hasError: boolean = false;
    let result = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const currentFormItem = this.formMap[key];
      const { error, value } = await currentFormItem.getValue();
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

  getConfig(key: string): FormConfigItem {
    const currentConfig = this.configFunc(this);
    const config: FormConfigItem = currentConfig[key] || {};
    config.key = key;
    return config;
  }

  // delegate(config:any) {
  //   const currentItem = this.defaultValues
  //   const newValue = setFormatValue(config, currentItem[config.key!])
  //   //为表单控件设置初始值
  //   other.setDefaultValue(newValue)
  //   other.setDisabled(this.disabled)
  //   this.formMap[name] = other
  // }
  render(): VNode | null {
    return <div style="width:100%;height:100%;">dadada</div>;
  }
}

const DATE_TYPES: string[] = ["month", "date", "week"];
function setFormatValue<T = any>(config: FormConfigItem, value: T): T | Moment {
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
  const { formatFunc, type, props } = config;
  const { format } = props || {};
  if (formatFunc) {
    return formatFunc(value);
  }
  if (!isNullOrUndefined(value) && DATE_TYPES.includes(type)) {
    if (format) {
      return (value as Moment).format(format);
    } else {
      return (value as Moment).format();
    }
  } else {
    return value;
  }
}
function isNullOrUndefined(val: any) {
  return val === null || val === undefined;
}
