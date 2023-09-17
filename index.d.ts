import type { PluginObject } from "@vuepress/core";

export type PositionOptions = {
  'z-index': string
} & (
  ({ left: string } | { right: string })
  &
  ({ top: string } | { bottom: string })
);
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
  draggable: boolean
  shrinkMode: "mini" | "float"
  floatPosition: "left" | "right"
  floatStyle: StyleValue
}

declare const _default: (options: Partial<BgPlayerOptions> & { audios: RequiredAudio[] }, context?: any) => PluginObject;

export = _default;
