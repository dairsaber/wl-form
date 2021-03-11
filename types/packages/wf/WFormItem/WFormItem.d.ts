import { Vue } from "vue-property-decorator";
import { CreateElement } from "vue";
import { VNode } from "vue";
import { ScopedSlotChildren } from "vue/types/vnode";
import { FormItemMethods, formDelegate, RenderItemFunc, FormConfigItem, FormItemValue, StatusMessage, ControllerRenderParams } from "@/packages/types";
export default class WFormItem extends Vue implements FormItemMethods {
    [x: string]: any;
    readonly disabled?: boolean;
    readonly delegate?: formDelegate;
    readonly options?: any;
    readonly renderItem?: RenderItemFunc;
    private rootComp;
    private setFormData;
    private validateDebounce;
    private currentDefaultValue;
    private currentControlValue;
    private isShowStatus;
    private currentHasError;
    private currentMessage;
    private currentDisabled;
    private currentStatus;
    private isNormalChangeFunc;
    private defaultStatus;
    private defaultMessage;
    private hidden;
    private currentOptions;
    private config;
    private changeFunc;
    private otherChangeFunc;
    mounted(): void;
    beforeDestroy(): void;
    set hasError(value: boolean);
    get hasError(): boolean;
    get currentValue(): any;
    set currentValue(value: any);
    /**
     * Gets form value
     * 用getter和setter 维护表单控件的方法
     */
    formValue(): Promise<FormItemValue<any>>;
    get status(): StatusMessage;
    get currentFormValue(): any;
    setRequired(isRequired: boolean): void;
    getFormDataValue(): any;
    getDefaultFormDataValue(): any;
    setValue(): void;
    getValue(): any;
    setDefaultValue(): void;
    getDefaultValue(): any;
    resetValue(): any;
    clearStatus(): void;
    /**
     * 校验
     * 会返回一个 校验状态 通过则 true 否则 false
     */
    onValidate(): Promise<boolean>;
    setDisabled(disabled: boolean): void;
    getValueWithValidate(): Promise<FormItemValue<any>>;
    /**
     * 设值并校验 返回一个校验是否通过的标识 通过则为true
     * @param value 表单值
     */
    setValueWithValidate(): Promise<boolean>;
    /**
     * 设置控件值 并延迟校验 保证及时验证的不必要性
     * @param value 控件值
     */
    setDebounceValue(value: any): void;
    setStatusMessage(obj: StatusMessage, permanent?: boolean): void;
    setOptions(value: any[]): void;
    hide(val?: boolean): void;
    protected onValueChange(_extra?: any): any;
    get inputController(): ScopedSlotChildren | VNode[];
    getFormInput({ config, value, defaultValue, disabled }: ControllerRenderParams, children?: VNode[] | ScopedSlotChildren): VNode;
    renderOptionsController({ config, value, defaultValue, disabled, options }: ControllerRenderParams): VNode;
    disabledWatch(val?: boolean): void;
    optionsWatch(val?: any[]): void;
    watchDefaultValues(val: FormConfigItem): void;
    watchHidden(val?: boolean): void;
    protected render(h: CreateElement): VNode | null;
}
