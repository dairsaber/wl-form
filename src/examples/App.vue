<template>
  <div id="app">
    <Test />
    <wl-form
      :defaultValues="{ custom: '滚一边去' }"
      :configFunc="configFunc"
      v-slot="{ delegate, getConfig }"
      :createForm="createForm"
    >
      <wl-form-item disabled :delegate="delegate" :config="getConfig('text')" />
      <wl-form-item :delegate="delegate" :config="getConfig('textarea')" />
      <wl-form-item :delegate="delegate" :config="getConfig('text2')" />
      <wl-form-item :delegate="delegate" :config="getConfig('text3')" />
      <wl-form-item :delegate="delegate" :config="getConfig('switch')" />
      <wl-form-item
        :delegate="delegate"
        :config="getConfig('select')"
        :options="['滚蛋', '滚犊子', '去你大爷的']"
        :renderItem="renderSelect"
      />
      <wl-form-item
        :delegate="delegate"
        :config="getConfig('radio')"
        :options="[
          { value: true, label: '是' },
          { value: false, label: '非' }
        ]"
        :renderItem="renderRadio"
      />
      <!-- 自定义写法 -->
      <wl-form-item
        :delegate="delegate"
        :config="getConfig('custom')"
        v-slot="{ setValue, value }"
      >
        <div style="width:100%;display:flex;margin-top:4px">
          <AInput
            style="flex:1"
            :value="value"
            @change="
              ({ target: { value } }) => {
                setValue(value);
              }
            "
          />
          <a-button
            @click="
              () => {
                setValue(undefined);
              }
            "
            >清空</a-button
          >
        </div>
      </wl-form-item>
    </wl-form>
    <AButton @click="handleSetStatus">给text3设置永久状态</AButton>
    <AButton @click="handleClearStatus">给text设置状态</AButton>
    <AButton @click="handleSubmit">获取值</AButton>
    <AButton @click="handleSetValues">设置值</AButton>
    <AButton @click="handleSetValuesWithValidate">设置一坨值并校验</AButton>
    <AButton @click="toogleControllers">隐藏或显示某些控件</AButton>
    <AButton @click="reset">重置</AButton>
    <AButton @click="setDefaultValue">改变默认值</AButton>
    <AButton @click="clear">clear</AButton>
    <p>{{ currentValue }}</p>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Test from "./components/Test";
import { Icon, Button, Input, Select, Radio } from "ant-design-vue";
import { VNode } from "vue";
enum FormItemType {
  text = "text",
  select = "select",
  radio = "radio",
  date = "date",
  month = "month",
  week = "week",
  number = "number",
  textarea = "textarea",
  checkbox = "checkbox",
  switch = "switch",
  checkboxGroup = "checkboxGroup",
  custom = "custom"
}
enum FormStatusType {
  error = "error",
  success = "success",
  warning = "warning",
  validating = "validating"
}
/**
 * 配置项 自己去看 FormConfig 定义
 *   key?: string;
 *   type: FormItemType;
 *   placeholder?: string;
 *   required?: boolean;
 *   tip?: setTip | string;
 *   label?: string | VNode;
 *   props?: FormProps; //{layout hasFeedback ...}
 *   defaultValue?: any;
 *   validate?: validateFunc;
 *   childProps?: CommonProp;
 *   filterFunc?: <T = any>(value: T) => T; 表单值 --过滤 --> 拿到的值
 *   formatFunc?: <T = any>(value: T) => T; 初始值 --格式化 --> 表单显示值
 */
function configFunc(context: Vue): wform.FormConfig {
  const h = context.$createElement;
  return {
    text: {
      type: FormItemType.text,
      label: "text",
      required: true,
      placeholder: "请输入.....",
      tip: "请输入正确的数据",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
        hasFeedback: true
      }
    },
    custom: {
      type: FormItemType.custom,
      label: "custom",
      required: true,
      tip: "请输入正确的数据",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      },
      validate: (value: any) => {
        if (value !== "滚") {
          return "该值不是'滚'";
        }
        return null;
      }
    },
    text2: {
      type: FormItemType.text,
      label: "text",
      required: true,
      tip: "请输入正确的数据",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      }
    },
    text3: {
      type: FormItemType.text,
      label: "text3",
      required: true,
      tip: "请输入正确的数据",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      }
    },
    select: {
      type: FormItemType.select,
      label: "select",
      required: true,
      tip: "请输入正确的数据",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      }
    },
    radio: {
      type: FormItemType.radio,
      label: "radio",
      required: true,
      tip: "请输入正确的数据",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      }
    },
    switch: {
      type: FormItemType.switch,
      label: "switch",
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 }
      }
    },
    textarea: {
      type: FormItemType.textarea,
      label: "textarea",
      placeholder: "请输入.....",
      required: true,
      tip: (): VNode => {
        return h("span", {}, [
          h(Icon, { props: { type: "smile" } }),
          "这是一段文字"
        ]);
      },
      props: {
        labelCol: { span: 3 },
        wrapperCol: { span: 20 },
        hasFeedback: true
      }
    }
  };
}
@Component({
  components: {
    Test,
    AButton: Button,
    AInput: Input
  }
})
// eslint-disable no-undef
export default class App extends Vue {
  private configFunc: wform.getFormConfig = configFunc;
  private form: wform.FormController | null = null;
  private currentValue: any = {};
  private createForm(formController: wform.FormController) {
    this.form = formController;
  }
  /**
   *  具体的操作api 看wform.FormController 的定义
   *  submit: <T = CommonProp>() => Promise<FormValue<T>>; //这是异步的
   *  getFormMap: () => CommonProp;
   *  setValues: (values: CommonProp) => void;
   *  clearValues: () => boolean;
   *  resetValues: () => boolean;
   *  getValue: <T = any>(key: string) => T;
   *  getValues: (keys?: string[]) => CommonProp;
   *  setStatus: (key: string, obj: StatusMessage, permanent?: boolean) => void;
   *  getValueWithValidate: (keys: string) => Promise<FormItemValue<any>>;
   *  setValuesWithValidate: (obj: CommonProp) => void;
   *  setValueWithValidate: (key: string, value: any) => Promise<boolean>;
   *  setDefaultValue: (key: string, value: any) => void;
   *  validate: (key?: string) => Promise<boolean>;
   * 解释
   * resetValues-->重置成默认值
   * clearValues-->清除所有表单数据
   * getValues--> 批量获取值 参数[...字段]
   * async getValuesWithValidate --> 获取值并校验
   * getValue(key) --> 获取目标值
   * async submit --> 提价and校验 返回{error,values}的结构 验证有误的情况下 error是true
   * setStatus(key,{status,message},isDefault) -->手动设置状态 有时候设置warn效果不错可以起到提示的作用
   * setDefaultValue(key,value) -->设置更改一个控件的默认值
   */
  private async handleSubmit() {
    if (this.form) {
      this.currentValue = await this.form.submit();
    }
  }
  private handleClearStatus(): void {
    if (this.form) {
      this.form.setStatus("text", {
        status: FormStatusType.warning,
        message: "花里胡哨的......"
      });
    }
  }
  private reset() {
    if (this.form) {
      this.form.resetValues();
    }
  }
  private setDefaultValue() {
    if (this.form) {
      this.form.setDefaultValue("custom", "wocacacacaca");
    }
  }
  private clear() {
    if (this.form) {
      this.form.clearValues();
    }
  }
  private handleSetStatus(): void {
    if (this.form) {
      this.form.setStatus(
        "text3",
        {
          status: FormStatusType.warning,
          message: "花里胡哨的......"
        },
        true //这个状态作为默认状态
      );
    }
  }
  private renderSelect(item: string) {
    return this.$createElement(Select.Option, { key: item }, item);
  }
  private renderRadio(item: any) {
    return this.$createElement(
      Radio,
      { key: item.value, props: { value: item.value } },
      item.label
    );
  }
  private handleSetValues(): void {
    if (this.form) {
      this.form.setValues({
        text: Math.random().toString(),
        text2: Math.random().toString(),
        textarea: Math.random() > 0.5 ? "大傻蛋啥的啥" : undefined,
        textxxx: "dsds"
      });
    }
  }
  private handleSetValuesWithValidate() {
    if (this.form) {
      this.form.setValuesWithValidate({
        text4: this.randomString(),
        text: this.randomString(),
        text2: this.randomString(),
        text3: this.randomString(),
        textarea: this.randomString(),
        textxxx: this.randomString(),
        switch: Math.random() > 0.5
      });
    }
  }
  private toogleControllers() {
    if (this.form) {
      this.form.hide({
        textarea: Math.random() > 0.5,
        switch: Math.random() > 0.5
      });
    }
  }
  private randomString() {
    const list = [
      "23333...",
      "擦擦擦擦擦擦...",
      "我是一直来自北方的浪",
      "我看到一个非常搞笑的人在天上飞翔...",
      "时间长了脑子也变成了翔",
      "滚",
      "呵呵哒",
      "唉,...................",
      undefined
    ];
    const length = list.length;
    return list[Math.floor(Math.random() * length)];
  }
}
</script>

<style lang="less">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
