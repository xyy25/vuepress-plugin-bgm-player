export function pad(num: number | string, n: number = 2): number | string {
  let len = num.toString().length
  while (len < n) {
    num = '0' + num;
    len++;
  }
  return num;
}

export function formatTime(interval: number): string {
  interval = interval | 0
  const minute = pad((interval / 60) | 0)
  const second = pad(interval % 60)
  return `${minute}:${second}`;
}
