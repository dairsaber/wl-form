import { VNode } from "vue";
import { ColSpanType } from "ant-design-vue/types/grid/col";
export declare type Record<S> = {
    [key: string]: S;
};
export declare type FormStatusType = "error" | "success" | "warning" | "validating";
export declare type FormItemType = "text" | "select" | "radio" | "date" | "month" | "week" | "number" | "textarea" | "checkbox" | "switch" | "checkboxGroup" | "custom";
/**
 *  form 的一些申明文件
 */
/**
 *  form 的一些申明文件
 */
export declare type FormConfig = {
    [key: string]: FormConfigItem;
};
export declare type AntCol = {
    span?: ColSpanType;
    xs?: {
        span: ColSpanType;
        offset: ColSpanType;
    } | ColSpanType;
    /**
     * ≥576px, could be a span value or an object containing above props
     * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
     */
    sm?: {
        span: ColSpanType;
        offset: ColSpanType;
    } | ColSpanType;
    /**
     * ≥768px, could be a span value or an object containing above props
     * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
     */
    md?: {
        span: ColSpanType;
        offset: ColSpanType;
    } | ColSpanType;
    /**
     * ≥992px, could be a span value or an object containing above props
     * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
     */
    lg?: {
        span: ColSpanType;
        offset: ColSpanType;
    } | ColSpanType;
    /**
     * ≥1200px, could be a span value or an object containing above props
     * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
     */
    xl?: {
        span: ColSpanType;
        offset: ColSpanType;
    } | ColSpanType;
    /**
     * ≥1600px, could be a span value or an object containing above props
     * @type { span: ColSpanType, offset: ColSpanType } | ColSpanType
     */
    xxl?: {
        span: ColSpanType;
        offset: ColSpanType;
    } | ColSpanType;
};
export declare enum LabelAlign {
    right = "right",
    left = "left"
}
export declare type validateFunc = {
    (value: any): VNode | string | null;
};
export declare type FormConfigItem = {
    key?: string;
    type: FormItemType;
    placeholder?: string;
    required?: boolean;
    tip?: setTip | string;
    label?: string | VNode;
    props?: Record<any>;
    attrs?: Record<any>;
    defaultValue?: any;
    validate?: validateFunc;
    childProps?: Record<any>;
    filterFunc?: <T = any>(value: T) => T;
    formatFunc?: <T = any>(value: T) => T;
};
export declare type SelectOption = {
    value: string | number;
    label: string | number | VNode;
    meta: Record<any>;
};
export declare type setTip = {
    (item?: FormConfigItem): string | VNode;
};
export declare type getFormConfig = {
    (context: any, params?: any): FormConfig;
};
/**
 * 表单submit 返回值得格式
 */
export declare type FormValue<T> = {
    error: boolean;
    values: T;
};
/**
 * Form controller
 */
export interface FormController {
    submit: <T = Record<any>>() => Promise<FormValue<T>>;
    getFormMap: () => Record<any>;
    setValues: (values: Record<any>) => void;
    clearValues: () => boolean;
    resetValues: () => boolean;
    getValue: <T = any>(key: string) => T;
    getValues: (keys?: string[]) => Record<any>;
    setStatus: (key: string, obj: StatusMessage, permanent?: boolean) => void;
    getValueWithValidate: (keys: string) => Promise<FormItemValue<any>>;
    setValuesWithValidate: (obj: Record<any>) => void;
    setValueWithValidate: (key: string, value: any) => Promise<boolean>;
    setDefaultValue: (key: string, value: any) => void;
    validate: (key?: string) => Promise<boolean>;
    setDisabled: (obj: {
        [key: string]: boolean;
    }) => void;
    setRequired: (obj: {
        [key: string]: boolean;
    }) => void;
    disableAll: () => void;
    enableAll: () => void;
    setOptions: (obj: {
        [key: string]: any[];
    }) => void;
    hide: (obj: {
        [key: string]: boolean;
    }) => void;
}
/**
 * 表单委托对象方法
 */
export declare type formDelegate = {
    (formItemInfo: FormItemInfo): void;
};
export declare type FormItemValue<T> = {
    error: boolean;
    value: T;
};
/**
 * 表单控件操作对象
 */
export declare type FormItemInfo = {
    config: FormConfigItem;
    methods: FormItemMethods;
};
/**
 * Form item methods
 */
export interface FormItemMethods {
    setValue: (value: any) => void;
    setDefaultValue: (value: any) => void;
    resetValue: () => any;
    onValidate: () => Promise<boolean>;
    setDisabled: (disabled: boolean) => void;
    setRequired: (isRequired: boolean) => void;
    getValueWithValidate: () => Promise<FormItemValue<any>>;
    setValueWithValidate: (value: any) => Promise<boolean>;
    getDefaultValue: () => any;
    getValue: () => any;
    setOptions: (val: any[]) => void;
    setStatusMessage: (obj: StatusMessage, permanent?: boolean) => void;
    hide: (isHidden: boolean) => void;
}
export declare type StatusMessage = {
    status: FormStatusType | null;
    message: string | VNode | null;
};
export declare type ControllerRenderParams = {
    config: FormConfigItem;
    value: any;
    defaultValue: any;
    disabled?: boolean;
    options?: any[];
};
export declare type RenderItemFunc = {
    (item: any): VNode;
};
