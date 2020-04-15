<template>
  <div id="app">
    <WForm
      :defaultValues="{ text: '1232' }"
      :configFunc="configFunc"
      v-slot="{ delegate, getConfig }"
    >
      <WFormItem :delegate="delegate" :config="getConfig('text')" />
    </WForm>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { wform } from "../../types";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function configFunc(context: Vue) {
  return {
    text: {
      type: wform.FormItemType.text,
      label: "text"
    }
  };
}
@Component({
  components: {}
})
export default class App extends Vue {
  private configFunc: wform.getFormConfig = configFunc;
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
