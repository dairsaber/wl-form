import Vue, { VNode } from "vue";
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
  type: FormItemType | string;
  required?: boolean;
  tip?: setTip | string;
  label?: string | VNode;
  props?: CommonProp;
  validate?: validateFunc;
}

declare interface setTip {
  (item: FormConfigItem): string;
}
declare interface getFormConfig {
  (context: Vue, params?: any): FormConfig;
}
