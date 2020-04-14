import Vue, { VNode } from "vue";
import { Col } from "ant-design-vue/types";
/**
 *  form 的一些申明文件
 */
declare type FormConfig = {
  [key: string]: FormConfigItem;
};
export type AntCol = Col;
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
export enum LabelAlign {
  right = "right",
  left = "left"
}
declare type CommonProp = {
  [key: string]: any;
};
declare type validateFunc = {
  (value: any): VNode | string | null;
};

declare type FormProps = {
  hasFeedback?: boolean;
  extra?: string | VNode;
  htmlFor?: string;
  labelAlign?: LabelAlign;
  labelCol: AntCol;
  wrapperCol: AntCol;
};
declare type FormConfigItem = {
  key?: string;
  type: FormItemType;
  required?: boolean;
  tip?: setTip | string;
  label?: string | VNode;
  props?: FormProps;
  validate?: validateFunc;
  childProps?: CommonProp;
  filterFunc?: <T = any>(value: T) => T;
  formatFunc?: <T = any>(value: T) => T;
};

declare type setTip = {
  (item: FormConfigItem): string;
};
declare type getFormConfig = {
  (context: any, params?: any): FormConfig;
};

declare type FormValue<T> = {
  error: boolean;
  values: T;
};
/**
 * Form controller
 */
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

/**
 * 表单委托对象方法
 */
declare type formDelegate = {
  (formItemInfo: FormItemInfo): void;
};
declare type FormItemValue<T> = {
  error: Boolean;
  value: T;
};
/**
 * 表单控件操作对象
 */
declare type FormItemInfo = {
  config: FormConfigItem;
  methods: FormItemMethods;
};
/**
 * Form item methods
 */
declare interface FormItemMethods {
  setValue: (value: any) => void;
  setDefaultValue: (value: any) => void;
  resetValue: () => any;
  onValidate: () => Promise<boolean>;
  setDisabled: (disabled: boolean) => void;
  getValueWithValidate: () => Promise<FormItemValue<any>>;
  setValueWithValidate: (value: any) => Promise<Boolean>;
  getDefaultValue: () => any;
}
