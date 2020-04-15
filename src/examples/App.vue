<template>
  <div id="app">
    <w-form
      :defaultValues="{ text: '1232' }"
      :configFunc="configFunc"
      v-slot="{ delegate, getConfig }"
      :createForm="createForm"
    >
      <w-form-item :delegate="delegate" :config="getConfig('text')" />
    </w-form>
    heheda
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import {
  getFormConfig,
  FormItemType,
  FormController
} from "../packages/types/wform";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function configFunc(context: Vue) {
  return {
    text: {
      type: FormItemType.text,
      label: "text"
    }
  };
}
@Component
export default class App extends Vue {
  private configFunc: getFormConfig = configFunc;
  private _form?: FormController;
  private createForm(formController: FormController) {
    this._form = formController;
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
