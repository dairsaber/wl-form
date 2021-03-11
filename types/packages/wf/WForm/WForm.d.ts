import { Vue } from "vue-property-decorator";
import { VNode } from "vue";
import { CreateElement } from "vue/types/umd";
import { FormConfigItem, FormController, getFormConfig, FormItemInfo, Record, FormItemValue, StatusMessage, FormValue } from "../../types";
export default class WForm extends Vue implements FormController {
    readonly loading: boolean;
    readonly configFunc: getFormConfig;
    readonly defaultValues: Record<any>;
    readonly createForm: (form: FormController) => void;
    readonly disabled: boolean;
    private myFormData;
    private myDefaultFormData;
    private rootComp;
    private setDefaultFormData;
    private setFormData;
    private currentConfig;
    protected formMap: {
        [key: string]: FormItemInfo;
    };
    protected created(): void;
    hide(obj: {
        [key: string]: boolean;
    }): void;
    setOptions(obj: {
        [key: string]: any[];
    }): void;
    getFormMap(): Record<any>;
    getValues(keys?: string[]): Record<any>;
    getValue(key: string): any;
    setValues<T extends Record<any> = any>(obj: T): void;
    disableAll(): void;
    enableAll(): void;
    setValuesWithValidate<T extends Record<any> = any>(obj: T): void;
    setValue<T = any>(key: string, value: T): void;
    setValueWithValidate(key: string, value: any): Promise<boolean>;
    validate(key?: string): Promise<boolean>;
    clearValues(): boolean;
    resetValues(): boolean;
    getValueWithValidate(key: string): Promise<FormItemValue<any>>;
    setStatus(key: string, obj: StatusMessage, permanent?: boolean): Promise<void>;
    submit<T>(): Promise<FormValue<T>>;
    getConfig(key?: string): FormConfigItem;
    removeField(key: string): void;
    setDefaultValue(key: string, value: any): void;
    setDisabled(obj?: {
        [key: string]: boolean;
    }): void;
    setRequired(obj?: {
        [key: string]: boolean;
    }): void;
    delegate(formItemInfo: FormItemInfo): void;
    protected render(h: CreateElement): VNode;
}
