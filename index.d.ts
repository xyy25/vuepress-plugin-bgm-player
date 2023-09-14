import type { PluginObject } from "@vuepress/core";

export interface PositionOptions {
  left: string,
  bottom: string,
  'z-index': string
}

export interface Audio {
  name: string,
  artist: string,
  url: string,
  cover: string
}

export interface BgPlayerOptions {
  position: Partial<PositionOptions>
  audios: Audio[]
  autoplay: boolean
  autoShrink: boolean
  shrinkMode: "mini" | "float"
  floatPosition: "left" | "right"
  floatStyle: CSSStyleDeclaration
}

declare const _default: (options?: Partial<BgPlayerOptions>, context?: any) => PluginObject;

export = _default;
