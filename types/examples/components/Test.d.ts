import { Vue } from "vue-property-decorator";
export default class Test extends Vue {
    private word;
    private onChangeValue;
    set currentWord(value: string);
    get currentWord(): string;
    get currentComputedWord(): string;
    render(): JSX.Element;
}
