import { Vue, Component } from "vue-property-decorator";
@Component
export default class Test extends Vue {
  private word = "";
  private onChangeValue() {
    this.currentWord = Math.random() + "";
  }
  set currentWord(value: string) {
    this.word = value;
  }
  get currentWord() {
    return this.word;
  }
  get currentComputedWord(): string {
    return this.word + "--" + this.currentWord;
  }
  render() {
    return (
      <div>
        <p>{this.currentComputedWord}</p>
        <button onClick={this.onChangeValue}>test</button>
      </div>
    );
  }
}
