import { unref, type MaybeRefOrGetter } from "vue";

type GradientTheme = { pos: number, color: string }[];
type RenderTheme = "bar" | "line";
type RenderFunc = (
  ctx: CanvasRenderingContext2D,
  theme: GradientTheme,
  sizeGetter: MaybeRefOrGetter<[number, number]>,
  dataArray: Uint8Array,
) => void

declare const __VUEPRESS_SSR__: boolean;

export default (bufferLength: number): Record<RenderTheme, RenderFunc> => {
  const colorPick = (gradient: CanvasGradient, arr: GradientTheme) => {
    arr.forEach(({ pos, color }) => gradient.addColorStop(pos, color));
  }
  const isDarkModeGetter = () => __VUEPRESS_SSR__ ?
    false : !!document.querySelector(".dark");

  const newBufferArray = () => new Array<number>(bufferLength).fill(0);
  const [ptcY, ptcV, ptcA] = [newBufferArray(), newBufferArray(), 0.1];

  return {
    bar(ctx, theme, sizeGetter, dataArray) {
      const [WIDTH, HEIGHT] = typeof sizeGetter === "function"
        ? sizeGetter() : unref(sizeGetter);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const barWidth = WIDTH / bufferLength;
      const isDarkMode = isDarkModeGetter();

      // bufferLength表示柱形图中矩形的个数，当前是128个
      for (let i = 0, x = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        colorPick(gradient, theme);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

        ctx.fillStyle = isDarkMode ? "white" : "black";
        if (ptcY[i] > barHeight) {
          ptcV[i] += ptcA;
          ptcY[i] -= ptcV[i];
        } else {
          ptcV[i] = 0;
          ptcY[i] = barHeight;
        }
        ctx.fillRect(x, HEIGHT - ptcY[i] - 3, barWidth, 3);
        x += barWidth + 2;
      }
    },
    line(ctx, theme, sizeGetter, dataArray) {
      const [WIDTH, HEIGHT] = typeof sizeGetter === "function"
        ? sizeGetter() : unref(sizeGetter);
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const dx = WIDTH / bufferLength;
      const midH = HEIGHT / 2;
      const isDarkMode = isDarkModeGetter();
      const step = 2;

      ctx.strokeStyle = isDarkMode ? "rgb(255,255,255)" : "rgb(0,0,0)";

      ctx.moveTo(0, midH - dataArray[0] / 2);
      for(let i = step, x = dx * step; i < bufferLength; i += step, x += dx * step) {
        const y = midH + dataArray[i] * (i % (step * 2) ? 1 : -1) / 2;

        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}
