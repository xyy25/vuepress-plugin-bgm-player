export const throttle = (
  func: (...args: any[]) => void,
  wait: number = 500
) => {
  let timer: NodeJS.Timeout | null;
  return (...args: any[]) => {
      if (timer) {
          return;
      }
      timer = setTimeout(() => {
          func.apply(func, args);
          timer = null;
      }, wait);
  };
};
