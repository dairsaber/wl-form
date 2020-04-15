<template>
  <div id="app">
    <Test />
    <w-form
      :defaultValues="{}"
      :configFunc="configFunc"
      v-slot="{ delegate, getConfig }"
      :createForm="createForm"
    >
      <w-form-item :delegate="delegate" :config="getConfig('text')" />
      <w-form-item :delegate="delegate" :config="getConfig('textarea')" />
      <w-form-item :delegate="delegate" :config="getConfig('text2')" />
    </w-form>
    <AButton @click="handleClearStatus">给text设置状态</AButton>
    <AButton @click="handleSubmit">获取值</AButton>
    <AButton @click="handleSetValues">设置值</AButton>
    <p>{{ currentValue }}</p>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Test from "./components/Test";
import {
  getFormConfig,
  FormItemType,
  FormController,
  FormConfig,
  FormStatusType
} from "../packages/types/wform";
import { Icon, Button } from "ant-design-vue";
import { VNode } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function configFunc(context: Vue): FormConfig {
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
    AButton: Button
  }
})
export default class App extends Vue {
  private configFunc: getFormConfig = configFunc;
  private form: FormController | null = null;
  private currentValue: any = {};
  private createForm(formController: FormController) {
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
