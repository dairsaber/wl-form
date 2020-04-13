import Vue, { VNode } from "vue";
/**
 *  form 的一些申明文件
 */
declare type FormConfig = {
  [key: string]: FormConfigItem;
};
export enum FormItemType {
  text = "text",
  select = "select",
  radio = "radio",
  date = "date",
  number = "number",
  textarea = "textarea",
  checkbox = "checkbox",
  switch = "switch",
  checkboxGroup = "checkboxGroup"
}
declare type CommonProp = {
  [key: string]: any;
};
declare interface validateFunc {
  (value: any): VNode | string | null;
}
declare interface FormConfigItem {
  key?: string;
  type: FormItemType | string;
  required?: boolean;
  tip?: setTip | string;
  label?: string | VNode;
  props?: CommonProp;
  validate?: validateFunc;
  filterFunc?: <T = any>(value: T) => T;
  formatFunc?: <T = any>(value: T) => T;
}

declare interface setTip {
  (item: FormConfigItem): string;
}
declare interface getFormConfig {
  (context: any, params?: any): FormConfig;
}

declare interface FormValue<T> {
  error: boolean;
  values: T;
}
declare interface FormController {
  submit: <T = CommonProp>() => Promise<FormValue<T>>; //这是异步的
  getFormMap: () => CommonProp;
  setValues: (values: CommonProp) => void;
  clearValues: () => boolean;
  resetValues: () => boolean;
  getValue: <T = any>(key: string) => T;
  getValues: <T = any>(keys: string[]) => T[];
  getValueWithValidate: <T = any>(keys: string[]) => T[];
}
