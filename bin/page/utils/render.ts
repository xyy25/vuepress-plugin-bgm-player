type GradientTheme = { pos: number, color: string }[];
type RenderTheme = "bar";
type RenderFunc = (
  ctx: CanvasRenderingContext2D,
  theme: GradientTheme,
  [WIDTH, HEIGHT]: [number, number],
  dataArray: Uint8Array,
) => void

declare const __VUEPRESS_SSR__: boolean;

export default (bufferLength: number): Record<RenderTheme, RenderFunc> => {
  const colorPick = (gradient: CanvasGradient, arr: GradientTheme) => {
    arr.forEach(({ pos, color }) => gradient.addColorStop(pos, color));
  }
  const newBufferArray = () => new Array<number>(bufferLength).fill(0);
  const [ptcY, ptcV, ptcA] = [newBufferArray(), newBufferArray(), 0.1];

  return {
    bar: (ctx, theme, [WIDTH, HEIGHT], dataArray) => {
      ctx.clearRect(0, 0, WIDTH, HEIGHT);

      const barWidth = WIDTH / bufferLength;
      const isDarkMode = __VUEPRESS_SSR__ ?
        false : !!document.querySelector(".dark");

      // bufferLength表示柱形图中矩形的个数，当前是128个
      for (let i = 0, x = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i];
        const gradient = ctx.createLinearGradient(0, 0, 0, 250);
        colorPick(gradient, theme);
        ctx.fillStyle = gradient;
        ctx.fillRect(x, 250 - barHeight, barWidth, barHeight);

        ctx.fillStyle = isDarkMode ? "white" : "black";
        if (ptcY[i] > barHeight) {
          ptcV[i] += ptcA;
          ptcY[i] -= ptcV[i];
        } else {
          ptcV[i] = 0;
          ptcY[i] = barHeight;
        }
        ctx.fillRect(x, 250 - ptcY[i] - 3, barWidth, 3);
        x += barWidth + 2;
      }
    }
  }
}
