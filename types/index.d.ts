import { VueConstructor } from "vue/types/vue";
import { VNode } from "vue";
import { ColSpanType } from "ant-design-vue/types/grid/col";
import {
  FormItemType as formItemType,
  FormStatusType as formStatusType
} from "../src/packages/wf/types/wf-types";
declare global {
  namespace common {
    export type Components = { [key: string]: VueConstructor };
  }
  /**
   *  form 的一些申明文件
   */
  namespace wform {
    /**
     *  form 的一些申明文件
     */
    export type FormConfig = {
      [key: string]: FormConfigItem;
    };
    export type AntCol = {
      span?: ColSpanType;
      xs?: { span: ColSpanType; offset: ColSpanType } | ColSpanType;

      /**
       * ≥576px, could be a span value or an object containing above props
       * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
       */
      sm?: { span: ColSpanType; offset: ColSpanType } | ColSpanType;

      /**
       * ≥768px, could be a span value or an object containing above props
       * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
       */
      md?: { span: ColSpanType; offset: ColSpanType } | ColSpanType;

      /**
       * ≥992px, could be a span value or an object containing above props
       * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
       */
      lg?: { span: ColSpanType; offset: ColSpanType } | ColSpanType;

      /**
       * ≥1200px, could be a span value or an object containing above props
       * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
       */
      xl?: { span: ColSpanType; offset: ColSpanType } | ColSpanType;

      /**
       * ≥1600px, could be a span value or an object containing above props
       * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
       */
      xxl?: { span: ColSpanType; offset: ColSpanType } | ColSpanType;
    };
    export type FormItemType = formItemType;
    export enum LabelAlign {
      right = "right",
      left = "left"
    }
    export type CommonProp = {
      [key: string]: any;
    };
    export type validateFunc = {
      (value: any): VNode | string | null;
    };

    export type FormProps = {
      hasFeedback?: boolean;
      extra?: string | VNode;
      htmlFor?: string;
      labelAlign?: LabelAlign;
      labelCol?: AntCol;
      wrapperCol?: AntCol;
    };
    export type FormConfigItem = {
      key?: string;
      type: FormItemType;
      placeholder?: string;
      required?: boolean;
      tip?: setTip | string;
      label?: string | VNode;
      props?: FormProps;
      defaultValue?: any;
      validate?: validateFunc;
      childProps?: CommonProp;
      filterFunc?: <T = any>(value: T) => T;
      formatFunc?: <T = any>(value: T) => T;
    };
    export type SelectOption = {
      value: string | number;
      label: string | number | VNode;
      meta: CommonProp;
    };
    export type setTip = {
      (item?: FormConfigItem): string | VNode;
    };
    export type getFormConfig = {
      (context: any, params?: any): FormConfig;
    };

    /**
     * 表单submit 返回值得格式
     */
    export type FormValue<T> = {
      error: boolean;
      values: T;
    };
    /**
     * Form controller
     */
    export interface FormController {
      submit: <T = CommonProp>() => Promise<FormValue<T>>; //这是异步的
      getFormMap: () => CommonProp;
      setValues: (values: CommonProp) => void;
      clearValues: () => boolean;
      resetValues: () => boolean;
      getValue: <T = any>(key: string) => T;
      getValues: (keys?: string[]) => CommonProp;
      setStatus: (key: string, obj: StatusMessage) => void;
      getValueWithValidate: (keys: string) => Promise<FormItemValue<any>>;
      setValuesWithValidate: (obj: CommonProp) => void;
      setValueWithValidate: (key: string, value: any) => Promise<boolean>;
      setDefaultValue: (key: string, value: any) => void;
      validate: (key?: string) => Promise<boolean>;
    }

    /**
     * 表单委托对象方法
     */
    export type formDelegate = {
      (formItemInfo: FormItemInfo): void;
    };
    export type FormItemValue<T> = {
      error: boolean;
      value: T;
    };
    /**
     * 表单控件操作对象
     */
    export type FormItemInfo = {
      config: FormConfigItem;
      methods: FormItemMethods;
    };
    /**
     * 表单状态
     */
    export type FormStatusType = formStatusType;
    /**
     * Form item methods
     */
    export interface FormItemMethods {
      setValue: (value: any) => void;
      setDefaultValue: (value: any) => void;
      resetValue: () => any;
      onValidate: () => Promise<boolean>;
      setDisabled: (disabled: boolean) => void;
      getValueWithValidate: () => Promise<FormItemValue<any>>;
      setValueWithValidate: (value: any) => Promise<boolean>;
      getDefaultValue: () => any;
      getValue: () => any;
      setStatusMessage: (obj: StatusMessage) => void;
    }
    export type StatusMessage = {
      status: FormStatusType | null;
      message: string | VNode | null;
    };

    export type ControllerRenderParams = {
      config: FormConfigItem;
      value: any;
      defaultValue: any;
    };
    export type RenderItemFunc = {
      (item: any): VNode;
    };
  }
}
