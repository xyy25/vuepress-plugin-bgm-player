export const throttle = <This = any>(
  func: (this: This, ...args: any[]) => void,
  wait: number = 500,
) => {
  let timer: NodeJS.Timeout | null;
  return function(this: This, ...args: any[]) {
      if (timer) {
          return;
      }
      timer = setTimeout(() => {
          func.apply(this, args);
          timer = null;
      }, wait);
  };
};
