export const debounce = <S extends (...args: unknown[]) => void>(callback: S, delay = 300) => {
  let timer: number | null = null;
  return (...args: Parameters<S>) => {
    // 判断定时器是否存在，清除定时器
    if (timer) {
      clearTimeout(timer);
    }

    // 重新调用setTimeout
    timer = setTimeout(() => {
      callback(...args);
    }, delay);
  };
};
