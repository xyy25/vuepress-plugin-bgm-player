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
  cover?: string
}

export type RequiredAudio = Audio | {
  type: "dir"
  url: string
}

export interface BgPlayerOptions {
  defaultCover: string
  position: Partial<PositionOptions>
  audios: RequiredAudio[]
  autoplay: boolean
  autoShrink: boolean
  shrinkMode: "mini" | "float"
  floatPosition: "left" | "right"
  floatStyle: StyleValue
}

declare const _default: (options: Partial<BgPlayerOptions> & { audios: RequiredAudio[] }, context?: any) => PluginObject;

export = _default;
