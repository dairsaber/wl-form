import { Vue, Component, Prop, Watch, Emit, Inject } from "vue-property-decorator";
import { CreateElement } from "vue";
import { VNode } from "vue";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Switch,
  DatePicker,
  Radio,
  Checkbox
} from "ant-design-vue";
import { ScopedSlotChildren } from "vue/types/vnode";
import { debounce } from "@/packages/utils";
import {
  FormItemType,
  FormItemMethods,
  formDelegate,
  RenderItemFunc,
  FormStatusType,
  FormConfigItem,
  FormItemValue,
  StatusMessage,
  ControllerRenderParams,
  Record
} from "@/packages/types";
const NodeMap: Record<any> = {
  text: Input,
  textarea: Input.TextArea,
  number: InputNumber,
  select: Select,
  switch: Switch,
  date: DatePicker,
  week: DatePicker.WeekPicker,
  month: DatePicker.MonthPicker,
  radio: Radio.Group,
  checkbox: Checkbox
};
const defaultInputStyle = (type: FormItemType): any => {
  const noStyleTypes = ["checkbox", "switch"];
  if (noStyleTypes.includes(type)) return {};
  return { width: "100%" };
};

@Component
export default class WFormItem extends Vue implements FormItemMethods {
  [x: string]: any;
  @Prop({ type: Boolean })
  readonly disabled?: boolean;
  @Prop({ type: Function })
  readonly delegate?: formDelegate;
  @Prop()
  readonly options?: any;
  @Prop({ type: Function })
  readonly renderItem?: RenderItemFunc;
  @Inject("rootComp") private rootComp!: any;
  @Inject("setFormData") private setFormData!: (obj?: { [key: string]: any }) => void;

  private validateDebounce = debounce(this.onValidate);
  //这边属性如果不付值的话将不会被注入vue的data中 大坑 而且不能赋值为undefined
  private currentDefaultValue: any = null;
  private currentControlValue: any = null;
  private isShowStatus = true;
  private currentHasError = false;
  private currentMessage: string | VNode | null = null;
  private currentDisabled = false;
  private currentStatus: FormStatusType | null = null;
  private isNormalChangeFunc = true;
  private defaultStatus: FormStatusType | null = null;
  private defaultMessage: string | VNode | null = null;
  private hidden = false;
  private currentOptions: any[] = [];
  private config: FormConfigItem = this.rootComp.getConfig(this.$vnode.key);

  private changeFunc({ target: { value } }: any) {
    this.setDebounceValue(value);
    this.onValueChange();
  }
  private otherChangeFunc(value: any) {
    this.setDebounceValue(value);
    this.onValueChange();
  }
  mounted() {
    this.delegate &&
      this.delegate({
        config: this.config,
        methods: {
          setValue: this.setValue,
          setRequired: this.setRequired,
          setDefaultValue: this.setDefaultValue,
          resetValue: this.resetValue,
          onValidate: this.onValidate,
          getValue: this.getValue,
          setDisabled: this.setDisabled,
          getValueWithValidate: this.getValueWithValidate,
          setValueWithValidate: this.setValueWithValidate,
          getDefaultValue: this.getDefaultValue,
          setStatusMessage: this.setStatusMessage,
          setOptions: this.setOptions,
          hide: this.hide
        }
      });
  }
  beforeDestroy() {
    this.rootComp.removeField(this.config.key);
  }
  set hasError(value: boolean) {
    this.currentHasError = value;
    if (value) {
      this.currentStatus = "error";
    } else {
      this.currentStatus = this.defaultStatus || "success";
      this.currentMessage = this.defaultMessage;
    }
  }
  get hasError(): boolean {
    return this.currentHasError;
  }
  get currentValue(): any {
    return this.currentControlValue;
  }
  //拦截所有赋值操作
  set currentValue(value: any) {
    this.currentControlValue = value;
  }
  /**
   * Gets form value
   * 用getter和setter 维护表单控件的方法
   */
  formValue(): Promise<FormItemValue<any>> {
    return new Promise<FormItemValue<any>>(r => {
      this.onValidate().then(validate => {
        r({
          error: !validate,
          value: this.currentFormValue
        });
      });
    });
  }
  // 当前控件的状态
  get status(): StatusMessage {
    const currentStatus = this.isShowStatus ? this.currentStatus : this.defaultStatus;
    return {
      status: currentStatus,
      message: this.isShowStatus ? this.currentMessage : this.defaultMessage
    };
  }
  get currentFormValue(): any {
    const value = this.currentValue || this.getFormDataValue();
    return value;
  }
  setRequired(isRequired: boolean) {
    this.config = { ...this.config, required: isRequired };
  }
  getFormDataValue() {
    return this.rootComp.myFormData[this.config.key + ""];
  }
  getDefaultFormDataValue() {
    return this.rootComp.myDefaultFormData[this.config.key + ""];
  }
  //设值
  setValue() {
    this.currentValue = this.getFormDataValue();
  }
  //获取值
  getValue(): any {
    return this.currentFormValue;
  }
  //设置默认值 这个会影响重置的时候表单控件值
  setDefaultValue() {
    this.currentDefaultValue = this.getDefaultFormDataValue();
    this.resetValue();
  }
  //获取默认值
  getDefaultValue(): any {
    return this.getDefaultFormDataValue();
  }
  // 重置控件值
  resetValue(): any {
    this.clearStatus();
    this.currentValue = this.getDefaultFormDataValue();
    return this.currentDefaultValue;
  }
  // 清除 表单校验状态 但是不重置 error状态 只是重置显示效果
  clearStatus(): void {
    this.isShowStatus = false;
  }
  /**
   * 校验
   * 会返回一个 校验状态 通过则 true 否则 false
   */
  async onValidate(): Promise<boolean> {
    this.isShowStatus = true;
    let isOk = true;
    if (this.config.required) {
      switch (true) {
        case typeof this.currentFormValue === "number":
        case typeof this.currentFormValue === "boolean":
          break;
        case typeof this.currentFormValue === "string":
          isOk = !!this.currentFormValue.trim();
          break;
        case Array.isArray(this.currentFormValue):
          isOk = !!this.currentFormValue.length;
          break;
        case typeof this.currentFormValue === "object":
          isOk = !!this.currentFormValue && !!Object.keys(this.currentFormValue).length;
          break;
        default:
          isOk = !!this.currentFormValue;
      }
    }
    if (!isOk) {
      if (typeof this.config.tip === "function") {
        this.currentMessage = this.config.tip(this.config);
      } else {
        this.currentMessage = this.config.tip || "";
      }
      this.hasError = true;
      return !this.hasError;
    }
    if (this.config.validate) {
      this.currentStatus = "validating";
      const message = await this.config.validate(this.currentFormValue);
      this.hasError = !!message;
      this.currentMessage = message;
    } else {
      this.hasError = false;
    }
    return !this.hasError;
  }
  // 设置控制控件disabled状态 一旦控件处于disable的状态则无法再次对其赋值
  setDisabled(disabled: boolean): void {
    this.currentDisabled = disabled;
  }
  //
  async getValueWithValidate(): Promise<FormItemValue<any>> {
    return this.formValue();
  }
  /**
   * 设值并校验 返回一个校验是否通过的标识 通过则为true
   * @param value 表单值
   */
  async setValueWithValidate(): Promise<boolean> {
    this.currentValue = this.getFormDataValue();
    const { error } = await this.formValue();
    return !error;
  }
  /**
   * 设置控件值 并延迟校验 保证及时验证的不必要性
   * @param value 控件值
   */
  setDebounceValue(value: any): void {
    this.setFormData({ [this.config.key || "unknown"]: value });
    this.currentValue = this.getFormDataValue();
    this.validateDebounce();
  }
  setStatusMessage(obj: StatusMessage, permanent?: boolean) {
    this.isShowStatus = true;
    this.currentMessage = obj.message;
    this.currentStatus = obj.status;
    if (permanent) {
      this.defaultStatus = obj.status;
      this.defaultMessage = obj.message;
    }
  }
  setOptions(value: any[]) {
    this.currentOptions = value;
  }
  //隐藏
  hide(val = true) {
    this.hidden = val;
  }
  // 发射change事件
  @Emit("input")
  @Emit("change")
  //eslint-disable-next-line
  protected onValueChange(_extra?: any) {
    return this.currentFormValue;
  }
  //控件本身
  get inputController(): ScopedSlotChildren | VNode[] {
    const value = this.currentFormValue;
    const config = this.config;
    const defaultValue = this.currentDefaultValue;
    const disabled = this.currentDisabled;
    const options = this.currentOptions;
    let currentController: VNode;
    const params: ControllerRenderParams = {
      config,
      value,
      defaultValue,
      disabled,
      options
    };
    switch (this.config.type) {
      case "radio":
        this.isNormalChangeFunc = true;
        currentController = this.renderOptionsController(params);
        break;
      case "select":
        currentController = this.renderOptionsController(params);
        this.isNormalChangeFunc = false;
        break;
      case "week":
      case "date":
      case "month":
      case "number":
      case "switch":
        this.isNormalChangeFunc = false;
        currentController = this.getFormInput(params);
        break;
      default:
        this.isNormalChangeFunc = true;
        currentController = this.getFormInput(params);
    }
    return [currentController];
  }
  // 获取基本空间
  getFormInput(
    { config, value, defaultValue, disabled }: ControllerRenderParams,
    children: VNode[] | ScopedSlotChildren = []
  ): VNode {
    // eslint-disable-next-line
    const { hasFeedback, labelCol, wrapperCol, ...other } = (config.props || {}) as any;
    const nodeConfig = {
      style: defaultInputStyle(config.type),
      attrs: {
        rows: (this.$attrs || {}).rows || (config.childProps || {}).rows || other.rows,
        ...config.attrs
      },
      props: {
        placeholder: config.placeholder,
        ...other,
        ...(config.childProps || {}),
        ...(this.$attrs || {}),
        disabled,
        defaultValue,
        defaultChecked: defaultValue,
        value,
        checked: value,
        rows: 20
      },
      on: {
        change: (event: any) => {
          if (this.isNormalChangeFunc) {
            this.changeFunc(event);
          } else {
            this.otherChangeFunc(event);
          }
        }
      }
    };
    return this.$createElement(NodeMap[config.type], nodeConfig, children);
  }
  //渲染带有option的控件
  renderOptionsController({
    config,
    value,
    defaultValue,
    disabled,
    options = []
  }: ControllerRenderParams): VNode {
    let optionVNodes: any[] = [];
    if (this.renderItem) {
      optionVNodes = options.map(optionItem => {
        if (this.renderItem) return this.renderItem(optionItem);
      });
    }
    return this.getFormInput({ config, value, defaultValue, disabled }, optionVNodes);
  }
  @Watch("disabled", { immediate: true })
  disabledWatch(val = false) {
    this.currentDisabled = val;
  }
  @Watch("options", { immediate: true })
  optionsWatch(val?: any[]) {
    if (val) {
      this.currentOptions = val;
    }
  }
  @Watch("config.defaultValue", { immediate: true })
  watchDefaultValues(val: FormConfigItem) {
    this.currentDefaultValue = val;
    this.currentControlValue = val;
  }
  @Watch("config.hidden", { immediate: true })
  watchHidden(val = false) {
    this.hidden = val;
  }

  protected render(h: CreateElement): VNode | null {
    if (this.hidden) return null;
    //准备数据
    const { status, message } = this.status;
    const config = this.config;
    const inputController = this.inputController;
    return h(
      Form.Item,
      {
        style: {
          textAlign: this.config.props?.labelAlign || "left"
        },
        props: {
          help: message,
          validateStatus: status,
          label: this.config.label,
          required: this.config.required,
          ...config.props
        }
      },
      [
        (this.$scopedSlots.default &&
          this.$scopedSlots.default({
            setValue: this.setDebounceValue,
            value: this.currentFormValue,
            disabled: this.currentDisabled,
            config
          })) ||
          inputController
      ]
    );
  }
}
