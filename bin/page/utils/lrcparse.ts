export default function lyricParser(lrc: string): { lyric: LRCObject[] } {
  return {
    'lyric': parseLyric(lrc || '')
    // 'tlyric': parseLyric(lrc.tlyric.lyric || '')
  }
}

export interface LRCObject {
  time: number;
  content: string;
}

export function parseLyric(lrc: string): LRCObject[] {
  const lyrics = lrc.split('\n');
  const lrcObj: LRCObject[] = [];
  for (let i = 0; i < lyrics.length; i++) {
    const lyric = decodeURIComponent(lyrics[i]);
    const timeReg = /\[\d*:\d*((\.|:)\d*)*\]/g;
    const timeRegExpArr = lyric.match(timeReg);
    if (!timeRegExpArr) continue;
    const content = lyric.replace(timeReg, '');
    for (let k = 0, h = timeRegExpArr.length; k < h; k++) {
      const t = timeRegExpArr[k];
      const min = Number(String(t.match(/\[\d*/i)).slice(1));
      const sec = Number(String(t.match(/:\d*/i)).slice(1));
      const time = min * 60 + sec;
      if (content !== '') {
        lrcObj.push({ time, content });
      }
    }
  }
  return lrcObj;
}
