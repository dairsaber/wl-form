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
  Radio
} from "ant-design-vue";
import { ScopedSlotChildren } from "vue/types/vnode";
import { Debounce } from "aftool";
import {
  FormItemType,
  FormItemMethods,
  FormConfigItem,
  formDelegate,
  FormStatusType,
  FormItemValue,
  StatusMessage,
  ControllerRenderParams,
  RenderItemFunc
} from "@/packages/types/wform";
const myDebounce = new Debounce();
const defaultInputStyle = { width: "100%" };
const NodeMap: { [key: string]: any } = {
  [FormItemType.text]: Input,
  [FormItemType.textarea]: Input.TextArea,
  [FormItemType.number]: InputNumber,
  [FormItemType.select]: Select,
  [FormItemType.switch]: Switch,
  [FormItemType.date]: DatePicker,
  [FormItemType.week]: DatePicker.WeekPicker,
  [FormItemType.month]: DatePicker.MonthPicker,
  [FormItemType.radio]: Radio.Group
};
@Component
export default class WFormItem extends Vue implements FormItemMethods {
  @Prop({ type: Object, required: true })
  readonly config!: FormConfigItem;
  @Prop({ type: Boolean })
  readonly disabled?: boolean;
  @Prop({ type: Function })
  readonly delegate?: formDelegate;
  @Prop()
  readonly options?: any;
  @Prop({ type: Function })
  readonly renderItem?: RenderItemFunc;

  //这边属性如果不付值的话将不会被注入vue的data中 大坑 而且不能赋值为undefined
  private currentDefaultValue: any = null;
  private currentControlValue: any = null;
  private isShowStatus = true;
  private currentHasError = false;
  private currentMessage: string | VNode | null = null;
  private currentDisabled = false;
  private currentStatus: FormStatusType | null = null;
  private isNormalChangeFunc = true;
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
          setStatusMessage: this.setStatusMessage
        }
      });
  }
  set hasError(value: boolean) {
    this.currentHasError = value;
    if (value) {
      this.currentStatus = FormStatusType.error;
    } else {
      this.currentStatus = FormStatusType.success;
      this.currentMessage = null;
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
  get formValue(): Promise<FormItemValue<any>> {
    return new Promise<FormItemValue<any>>(r => {
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
  get status(): StatusMessage {
    const currentStatus = this.isShowStatus ? this.currentStatus : null;
    return {
      status: currentStatus,
      message: this.isShowStatus ? this.currentMessage : null
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
      this.currentMessage = await this.config.validate(this.currentValue);
      this.hasError = this.currentMessage !== null;
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
  setStatusMessage(obj: StatusMessage) {
    this.isShowStatus = true;
    this.currentMessage = obj.message;
    this.currentStatus = obj.status;
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
    const scopedSlotFunc = this.$scopedSlots["default"];
    if (scopedSlotFunc) {
      return scopedSlotFunc({
        setValue: this.setDebounceValue
      });
    }
    let currentController: VNode;
    const params: ControllerRenderParams = { config, value, defaultValue };
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
    { config, value, defaultValue }: ControllerRenderParams,
    children: VNode[] | ScopedSlotChildren = []
  ): VNode {
    return this.$createElement(
      NodeMap[config.type],
      {
        style: defaultInputStyle,
        props: {
          defaultValue,
          value,
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
    defaultValue
  }: ControllerRenderParams): VNode {
    const options: any[] = this.options as any[];
    let optionVNodes: any[] = [];
    if (this.renderItem) {
      optionVNodes = options.map(optionItem => {
        if (this.renderItem) return this.renderItem(optionItem);
      });
    }
    return this.getFormInput({ config, value, defaultValue }, optionVNodes);
  }

  @Watch("config.defaultValue", { immediate: true })
  watchDefaultValues(val: FormConfigItem) {
    this.currentDefaultValue = val;
    this.currentControlValue = val;
  }

  protected render(h: CreateElement): VNode {
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
