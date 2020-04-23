<template>
  <div id="app">
    <Test />
    <wl-form
      :defaultValues="{}"
      :configFunc="configFunc"
      v-slot="{ delegate, getConfig }"
      :createForm="createForm"
    >
      <wl-form-item :delegate="delegate" :config="getConfig('text')" />
      <wl-form-item :delegate="delegate" :config="getConfig('textarea')" />
      <wl-form-item :delegate="delegate" :config="getConfig('text2')" />
      <wl-form-item :delegate="delegate" :config="getConfig('text3')" />
      <wl-form-item :delegate="delegate" :config="getConfig('switch')" />
      <!-- 自定义写法 -->
      <wl-form-item
        :delegate="delegate"
        :config="getConfig('custom')"
        v-slot="{ setValue, value }"
      >
        <div style="width:100%;display:flex;margin-top:4px">
          <AInput
            size="small"
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
    <p>{{ currentValue }}</p>
  </div>
</template>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Test from "./components/Test";
import { Icon, Button, Input } from "ant-design-vue";
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
  private async handleSubmit() {
    if (this.form) {
      this.currentValue = await this.form.submit();
    }
  }
  private handleClearStatus(): void {
    if (this.form) {
      this.form.setStatus("text", {
        status: FormStatusType.warning,
        message: "草草草草....."
      });
    }
  }
  private handleSetStatus(): void {
    if (this.form) {
      this.form.setStatus(
        "text3",
        {
          status: FormStatusType.warning,
          message: "草草草草....."
        },
        true
      );
    }
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
  private randomString() {
    const list = [
      "23333...",
      "擦擦擦擦擦擦...",
      "你有病吧",
      "你才有病",
      "脑子里有屎",
      "滚",
      "呵呵哒",
      "你妹的",
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
