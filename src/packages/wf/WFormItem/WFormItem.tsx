import { Vue, Component, Prop, Watch, Emit } from "vue-property-decorator";
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
import { Debounce } from "aftool";
import { FormItemType, FormStatusType } from "../types/wf-types";

const myDebounce = new Debounce();
const NodeMap: { [key: string]: any } = {
  [FormItemType.text]: Input,
  [FormItemType.textarea]: Input.TextArea,
  [FormItemType.number]: InputNumber,
  [FormItemType.select]: Select,
  [FormItemType.switch]: Switch,
  [FormItemType.date]: DatePicker,
  [FormItemType.week]: DatePicker.WeekPicker,
  [FormItemType.month]: DatePicker.MonthPicker,
  [FormItemType.radio]: Radio.Group,
  [FormItemType.checkbox]: Checkbox
};
const defaultInputStyle = (type: FormItemType): any => {
  const noStyleTypes = [FormItemType.checkbox, FormItemType.switch];
  if (noStyleTypes.includes(type)) return {};
  return { width: "100%" };
};

@Component
export default class WFormItem extends Vue implements wform.FormItemMethods {
  @Prop({ type: Object, required: true })
  readonly config!: wform.FormConfigItem;
  @Prop({ type: Boolean })
  readonly disabled?: boolean;
  @Prop({ type: Function })
  readonly delegate?: wform.formDelegate;
  @Prop()
  readonly options?: any;
  @Prop({ type: Function })
  readonly renderItem?: wform.RenderItemFunc;

  //这边属性如果不付值的话将不会被注入vue的data中 大坑 而且不能赋值为undefined
  private currentDefaultValue: any = null;
  private currentControlValue: any = null;
  private isShowStatus = true;
  private currentHasError = false;
  private currentMessage: string | VNode | null = null;
  private currentDisabled = false;
  private currentStatus: wform.FormStatusType | null = null;
  private isNormalChangeFunc = true;
  private defaultStatus: FormStatusType | null = null;
  private defaultMessage: string | VNode | null = null;
  private hidden = false;
  private currentOptions: any[] = [];
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
  set hasError(value: boolean) {
    this.currentHasError = value;
    if (value) {
      this.currentStatus = FormStatusType.error;
    } else {
      this.currentStatus = this.defaultStatus || FormStatusType.success;
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
    if (this.currentDisabled) return;
    this.currentControlValue = value;
  }
  /**
   * Gets form value
   * 用getter和setter 维护表单控件的方法
   */
  get formValue(): Promise<wform.FormItemValue<any>> {
    return new Promise<wform.FormItemValue<any>>(r => {
      this.onValidate().then(validate => {
        r({
          error: !validate,
          value: this.currentValue
        });
      });
    });
  }
  set formValue(value) {
    this.currentValue = value;
  }
  // 当前控件的状态
  get status(): wform.StatusMessage {
    const currentStatus = this.isShowStatus
      ? this.currentStatus
      : this.defaultStatus;
    return {
      status: currentStatus,
      message: this.isShowStatus ? this.currentMessage : this.defaultMessage
    };
  }
  //设值
  setValue(value: any) {
    this.currentValue = value;
  }
  //获取值
  getValue(): any {
    return this.currentValue;
  }
  //设置默认值 这个会影响重置的时候表单控件值
  setDefaultValue(value: any) {
    this.currentDefaultValue = value;
    this.resetValue();
  }
  //获取默认值
  getDefaultValue(): any {
    return this.currentDefaultValue;
  }
  // 重置控件值
  resetValue(): any {
    this.clearStatus();
    this.currentValue = this.currentDefaultValue;
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
        case typeof this.currentValue === "string":
          isOk = !!this.currentValue.trim();
          break;
        case Array.isArray(this.currentValue):
          isOk = !!this.currentValue.length;
          break;
        case typeof this.currentValue === "object":
          isOk = !!this.currentValue && !!Object.keys(this.currentValue).length;
          break;
        default:
          isOk = !!this.currentValue;
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
      this.currentStatus = FormStatusType.validating;
      const message = await this.config.validate(this.currentValue);
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
  async getValueWithValidate(): Promise<wform.FormItemValue<any>> {
    return this.formValue;
  }
  /**
   * 设值并校验 返回一个校验是否通过的标识 通过则为true
   * @param value 表单值
   */
  async setValueWithValidate(value: any): Promise<boolean> {
    this.formValue = value;
    const { error } = await this.formValue;
    return !error;
  }
  /**
   * 设置控件值 并延迟校验 保证及时验证的不必要性
   * @param value 控件值
   */
  setDebounceValue(value: any): void {
    this.currentValue = value;
    myDebounce.go(() => {
      this.onValidate();
    }, 300);
  }
  setStatusMessage(obj: wform.StatusMessage, permanent?: boolean) {
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
    return this.currentValue;
  }
  //控件本身
  get inputController(): ScopedSlotChildren | VNode[] {
    const value = this.currentValue;
    const config = this.config;
    const defaultValue = this.currentDefaultValue;
    const disabled = this.currentDisabled;
    const scopedSlotFunc = this.$scopedSlots["default"];
    const options = this.currentOptions;
    if (scopedSlotFunc) {
      return scopedSlotFunc({
        setValue: this.setDebounceValue,
        value,
        disabled
      });
    }
    let currentController: VNode;
    const params: wform.ControllerRenderParams = {
      config,
      value,
      defaultValue,
      disabled,
      options
    };
    switch (this.config.type) {
      case FormItemType.radio:
        currentController = this.renderOptionsController(params);
        break;
      case FormItemType.select:
        currentController = this.renderOptionsController(params);
        this.isNormalChangeFunc = false;
        break;
      case FormItemType.week:
      case FormItemType.date:
      case FormItemType.month:
      case FormItemType.number:
      case FormItemType.switch:
        this.isNormalChangeFunc = false;
        currentController = this.getFormInput(params);
        break;
      default:
        currentController = this.getFormInput(params);
    }
    return [currentController];
  }
  // 获取基本空间
  getFormInput(
    { config, value, defaultValue, disabled }: wform.ControllerRenderParams,
    children: VNode[] | ScopedSlotChildren = []
  ): VNode {
    return this.$createElement(
      NodeMap[config.type],
      {
        style: defaultInputStyle(config.type),
        props: {
          disabled,
          defaultValue,
          defaultChecked: defaultValue,
          value,
          checked: value,
          placeholder: this.config.placeholder,
          ...this.config.childProps
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
      },
      children
    );
  }
  //渲染带有option的控件
  renderOptionsController({
    config,
    value,
    defaultValue,
    disabled,
    options = []
  }: wform.ControllerRenderParams): VNode {
    let optionVNodes: any[] = [];
    if (this.renderItem) {
      optionVNodes = options.map(optionItem => {
        if (this.renderItem) return this.renderItem(optionItem);
      });
    }
    return this.getFormInput(
      { config, value, defaultValue, disabled },
      optionVNodes
    );
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
  watchDefaultValues(val: wform.FormConfigItem) {
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
      [inputController]
    );
  }
}
