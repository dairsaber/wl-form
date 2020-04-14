import { Vue, Prop, Watch, Emit } from "vue-property-decorator";
import { CreateElement } from "vue";
import { VNode } from "vue";
import { Form, Input, InputNumber } from "ant-design-vue";
import { ScopedSlotChildren } from "vue/types/vnode";
import { Debounce } from "aftool";
import {
  FormConfigItem,
  formDelegate,
  FormItemValue,
  FormItemMethods,
  CommonProp,
  FormItemType
} from "../../types";

const myDebounce = new Debounce();
const defaultInputStyle = { width: "100%" };
const NodeMap: { [key: string]: any } = {
  [FormItemType.text]: Input,
  [FormItemType.textarea]: Input.TextArea,
  [FormItemType.number]: InputNumber
};
enum StatusType {
  error = "error",
  success = "success",
  warning = "warning",
  validating = "validating"
}

export default class WFormItem extends Vue implements FormItemMethods {
  @Prop({ type: Object, required: true })
  readonly config!: FormConfigItem;
  @Prop({ type: Object })
  readonly defaultValue: any;
  @Prop({ type: Boolean })
  readonly disabled?: boolean;
  @Prop()
  readonly value?: any;
  @Prop({ type: Function })
  readonly delegate?: formDelegate;

  private _defaultValue: any = undefined;
  private _value: any = undefined;
  private _isShowStatus: boolean = true;
  private _hasError: boolean = false;
  private _message: string | VNode | null = "";
  private _disabled: boolean = false;
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
          setDisabled: this.setDisabled,
          getValueWithValidate: this.getValueWithValidate,
          setValueWithValidate: this.setValueWithValidate,
          getDefaultValue: this.getDefaultValue
        }
      });
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
  get status(): { hide: boolean; status: StatusType; message: string } {
    return {
      hide: true,
      status: StatusType.error,
      message: ""
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
  }
  //获取默认值
  public getDefaultValue(): any {
    return this._defaultValue;
  }
  // 重置控件值
  public resetValue(): any {
    this.currentValue = this._defaultValue;
    this.clearStatus();
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
          isOk = !!this.value && !!Object.keys(this.currentValue).length;
          break;
        default:
          isOk = !!this.currentValue;
      }
    }
    if (!isOk) {
      this._hasError = true;
      return !this._hasError;
    }
    if (this.config.validate) {
      this._message = await this.config.validate(this.currentValue);
      this._hasError = this._message === null;
    }
    return !this._hasError;
  }
  // 设置控制控件disabled状态 一旦控件处于disable的状态则无法再次对其赋值
  public setDisabled(disabled: boolean): void {
    this._disabled = disabled;
  }
  //
  public async getValueWithValidate(): Promise<FormItemValue<any>> {
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
    switch (this.config.type) {
      case FormItemType.number:
        // TODO  根据不同的 type change 处理函数不一样
        this._changeFunc = () => {};
    }
    return [this.formInput];
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

  @Watch("defaultValue", { immediate: true })
  public watchDefaultValues(val: any) {
    this._defaultValue = val;
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
