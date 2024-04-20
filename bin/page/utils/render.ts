import { unref, type MaybeRefOrGetter } from "vue";

type GradientTheme = { pos: number, color: string }[];
type RenderTheme = "bar" | "line";
type RenderFunc = (
  frequencyArray: Uint8Array,
  timeDomainArray: Uint8Array,
) => (
  ctx: CanvasRenderingContext2D,
  theme: GradientTheme,
  sizeGetter: MaybeRefOrGetter<[number, number]>,
) => void

declare const __VUEPRESS_SSR__: boolean;

export default (bufferLength: number): Record<RenderTheme, RenderFunc> => {
  const colorPick = (gradient: CanvasGradient, arr: GradientTheme) => {
    arr.forEach(({ pos, color }) => gradient.addColorStop(pos, color));
  }
  const isDarkModeGetter = () => __VUEPRESS_SSR__ ?
    false : !!document.querySelector(".dark");

  const newBufferArray = () => new Array<number>(bufferLength).fill(0);
  const [ptcY, ptcV, ptcA] = [newBufferArray(), newBufferArray(), 0.02];

  return {
    bar(frequencyArray) {
      for (let i = 0; i < bufferLength; i++) {
        if (ptcY[i] > frequencyArray[i]) {
          ptcV[i] += ptcA;
          ptcY[i] -= ptcV[i];
        } else {
          ptcV[i] = 0;
          ptcY[i] = frequencyArray[i];
        }
      }

      return function(ctx, theme, sizeGetter) {
        const [WIDTH, HEIGHT] = typeof sizeGetter === "function"
          ? sizeGetter() : unref(sizeGetter);
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        const barWidth = WIDTH / bufferLength;
        const isDarkMode = isDarkModeGetter();
        const HEIGHT_RATE = HEIGHT / 256;

        // bufferLength表示柱形图中矩形的个数，当前是128个
        for (let i = 0, x = 0; i < bufferLength; i++) {
          const barHeight = frequencyArray[i] * HEIGHT_RATE;
          const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
          colorPick(gradient, theme);
          ctx.fillStyle = gradient;
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight);

          ctx.fillStyle = isDarkMode ? "white" : "rgb(68 182 165)";
          ctx.fillRect(x, HEIGHT - ptcY[i] * HEIGHT_RATE - 3, barWidth, 3);
          x += barWidth + 2;
        }
      }
    },
    line(_, timeDomainArray) {

      return function(ctx, theme, sizeGetter) {
        const [WIDTH, HEIGHT] = typeof sizeGetter === "function"
          ? sizeGetter() : unref(sizeGetter);
        ctx.clearRect(0, 0, WIDTH, HEIGHT);

        const dx = WIDTH / bufferLength;
        const isDarkMode = isDarkModeGetter();
        const HEIGHT_RATE = HEIGHT / 256;

        ctx.beginPath();
        ctx.strokeStyle = isDarkMode ? "rgb(255,255,255)" : "rgb(0,0,0)";
        ctx.moveTo(0, timeDomainArray[0] * HEIGHT_RATE);
        for(let i = 0, x = dx; i < bufferLength; i++, x += dx) {
          const y = timeDomainArray[i] * HEIGHT_RATE;

          ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
  }
}
