import { Vue, Prop, Watch, Emit } from "vue-property-decorator";
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
const myDebounce = new Debounce();
const defaultInputStyle = { width: "100%" };
const NodeMap: { [key: string]: any } = {
  [wform.FormItemType.text]: Input,
  [wform.FormItemType.textarea]: Input.TextArea,
  [wform.FormItemType.number]: InputNumber,
  [wform.FormItemType.select]: Select,
  [wform.FormItemType.switch]: Switch,
  [wform.FormItemType.date]: DatePicker,
  [wform.FormItemType.week]: DatePicker.WeekPicker,
  [wform.FormItemType.month]: DatePicker.MonthPicker,
  [wform.FormItemType.radio]: Radio.Group
};

export default class WFormItem extends Vue implements wform.FormItemMethods {
  @Prop({ type: Object, required: true })
  readonly config!: wform.FormConfigItem;
  @Prop({ type: Boolean })
  readonly disabled?: boolean;
  @Prop({ type: Function })
  readonly delegate?: wform.formDelegate;
  @Prop()
  readonly options?: any;
  private _defaultValue: any = undefined;
  private _value: any = undefined;
  private _isShowStatus: boolean = true;
  private _hasError: boolean = false;
  private _message: string | VNode | null = "";
  private _disabled: boolean = false;
  private _status: wform.FormStatusType = wform.FormStatusType.success;
  private _changeFunc: Function = ({ target: { value } }: any) => {
    this.setDebounceValue(value);
    this.onValueChange();
  };

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
    this._isShowStatus = true;
    if (value) {
      this._status = wform.FormStatusType.error;
    } else {
      this._status = wform.FormStatusType.success;
    }
  }
  get hasError(): boolean {
    return this._hasError;
  }
  get currentValue(): any {
    return this._value;
  }
  //拦截所有赋值操作
  set currentValue(value: any) {
    if (this._disabled) return;
    this._value = value;
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
    let currentStatus = this._isShowStatus
      ? this._status
      : wform.FormStatusType.success;
    return {
      status: currentStatus,
      message: this._message || ""
    };
  }
  //设值
  public setValue(value: any) {
    this.currentValue = value;
  }
  //获取值
  public getValue(): any {
    return this.currentValue;
  }
  //设置默认值 这个会影响重置的时候表单控件值
  public setDefaultValue(value: any) {
    this._defaultValue = value;
    this.resetValue();
  }
  //获取默认值
  public getDefaultValue(): any {
    return this._defaultValue;
  }
  // 重置控件值
  public resetValue(): any {
    this.clearStatus();
    this.currentValue = this._defaultValue;
    return this._defaultValue;
  }
  // 清除 表单校验状态 但是不重置 error状态 只是重置显示效果
  public clearStatus(): void {
    this._isShowStatus = false;
  }
  /**
   * 校验
   * 会返回一个 校验状态 通过则 true 否则 false
   */
  public async onValidate(): Promise<boolean> {
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
        this._message = this.config.tip(this.config);
      } else {
        this._message = this.config.tip || "";
      }
      this.hasError = true;
      return !this.hasError;
    }
    if (this.config.validate) {
      this._status = wform.FormStatusType.validating;
      this._message = await this.config.validate(this.currentValue);
      this.hasError = this._message === null;
    }
    return !this.hasError;
  }
  // 设置控制控件disabled状态 一旦控件处于disable的状态则无法再次对其赋值
  public setDisabled(disabled: boolean): void {
    this._disabled = disabled;
  }
  //
  public async getValueWithValidate(): Promise<wform.FormItemValue<any>> {
    return this.formValue;
  }
  /**
   * 设值并校验 返回一个校验是否通过的标识 通过则为true
   * @param value 表单值
   */
  public async setValueWithValidate(value: any): Promise<boolean> {
    this.formValue = value;
    const { error } = await this.formValue;
    return !error;
  }
  /**
   * 设置控件值 并延迟校验 保证及时验证的不必要性
   * @param value 控件值
   */
  public setDebounceValue(value: any): void {
    this.currentValue = value;
    myDebounce.go(() => {
      this.onValidate();
    }, 300);
  }
  public setStatusMessage(obj: wform.StatusMessage) {
    this._isShowStatus = true;
    this._message = obj.message;
    this._status = obj.status;
  }
  // 发射change事件
  @Emit("input")
  @Emit("change")
  private onValueChange(extra?: any) {
    return this._value;
  }
  //控件本身
  get child(): ScopedSlotChildren {
    const scopedSlotFunc = this.$scopedSlots["default"];
    if (scopedSlotFunc) {
      return scopedSlotFunc({
        setValue: this.setDebounceValue
      });
    }
    const otherChangeFunc = (value: any) => {
      this.setDebounceValue(value);
      this.onValueChange();
    };
    let currentController;
    switch (this.config.type) {
      case wform.FormItemType.radio:
        currentController = this.renderRadio;
        break;
      case wform.FormItemType.select:
        currentController = this.renderSelector;
        this._changeFunc = otherChangeFunc;
        break;
      case wform.FormItemType.week:
      case wform.FormItemType.date:
      case wform.FormItemType.month:
      case wform.FormItemType.number:
      case wform.FormItemType.switch:
        // TODO  根据不同的 type change 处理函数不一样
        this._changeFunc = otherChangeFunc;
      default:
        currentController = this.formInput;
    }
    return [currentController];
  }
  // 获取控件
  get formInput(): VNode {
    const childProps = this.config.childProps;
    const defaultValue = this._defaultValue;
    const value = this._value;
    return this.$createElement(NodeMap[this.config.type], {
      style: defaultInputStyle,
      props: {
        defaultValue,
        value,
        ...childProps
      },
      on: {
        change: this._changeFunc
      }
    });
  }
  //其他 特殊的控件渲染
  // select
  get renderSelector(): VNode {
    const childProps = this.config.childProps;
    const defaultValue = this._defaultValue;
    const value = this._value;
    const options: any[] = this.options as any[];
    const optionVNodes = options.map(optionItem => {
      if (!this.$scopedSlots["select"])
        throw "选择器需要一个渲染下拉选项的函数";
      return this.$scopedSlots["select"]!(optionItem);
    });
    return this.$createElement(
      NodeMap[this.config.type],
      {
        style: defaultInputStyle,
        props: {
          defaultValue,
          value,
          ...childProps
        },
        on: {
          change: this._changeFunc
        }
      },
      optionVNodes
    );
  }
  get renderRadio(): VNode {
    const childProps = this.config.childProps;
    const defaultValue = this._defaultValue;
    const value = this._value;
    const options: any[] = this.options as any[];
    const optionVNodes = options.map(optionItem => {
      if (!this.$scopedSlots["radio"]) throw "选择器需要一个渲染下拉选项的函数";
      return this.$scopedSlots["radio"]!(optionItem);
    });
    return this.$createElement(
      NodeMap[this.config.type],
      {
        style: defaultInputStyle,
        props: {
          defaultValue,
          value,
          ...childProps
        },
        on: {
          change: this._changeFunc
        }
      },
      optionVNodes
    );
  }

  @Watch("config", { immediate: true })
  public watchDefaultValues(val: wform.FormConfigItem) {
    this._defaultValue = val.defaultValue;
  }
  public render(h: CreateElement): VNode {
    //准备数据
    const { status, message } = this.status;
    const disabled = this._disabled;
    const config = this.config;
    const child = this.child;

    return h(
      Form.Item,
      {
        props: {
          disabled,
          help: message,
          status,
          ...config.props
        }
      },
      [child]
    );
  }
}
