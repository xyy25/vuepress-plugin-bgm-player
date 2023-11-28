import type { PluginObject } from "@vuepress/core";
import type { StyleValue } from "vue";

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
  lrc?: string,
  cover?: string,
}

export type RequiredAudio = Audio | LocalAudio | RemoteAudio;

export interface LocalAudio {
  type: "dir"
  url: string
}

export interface RemoteAudio {
  type: "remote"
  api: string,
  from: "netease",
  mid: string,
  replaceUrl?: Record<string, AudioReplace>,
}

export interface AudioReplace {
  url: string,
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

declare const _default: (options: Partial<BgPlayerOptions>, context?: any) => PluginObject;

export = _default;
