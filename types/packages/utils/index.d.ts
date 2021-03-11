export declare const debounce: <S extends (...args: unknown[]) => void>(callback: S, delay?: number) => (...args: Parameters<S>) => void;
