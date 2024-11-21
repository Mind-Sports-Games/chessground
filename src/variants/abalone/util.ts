import * as cg from '../../types';
import * as T from '../../transformations';

const abaloneFiles = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'] as const;

const abaloneRanks = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

export const pos2key = (pos: cg.Pos): cg.Key => {
  let posx = pos[0];
  if (pos[1] == 1) {
    posx = pos[0] - 3;
  }
  if (pos[1] == 2) {
    posx = pos[0] - 2; // -2.5
  }
  if (pos[1] == 3) {
    posx = pos[0] - 2;
  }
  if (pos[1] == 4) {
    posx = pos[0] - 1; // -1.5
  }
  if (pos[1] == 5) {
    posx = pos[0] - 1; // - 1
  }
  if (pos[1] == 6) {
    posx = pos[0]; // -0.5
  }
  if (pos[1] == 7) {
    posx = pos[0]; // 0
  }
  if (pos[1] == 8) {
    posx = pos[0]; // 0.5
  }
  if (pos[1] == 9) {
    posx = pos[0] + 1;
  }

  const key = (abaloneFiles[posx] + abaloneRanks[pos[1] - 1]) as cg.Key;
  return key;
};

export const key2pos = (k: cg.Key): cg.Pos => {
  return [k.charCodeAt(0) - 96, parseInt(k.slice(1))] as cg.Pos;
};

export const key2posAlt = (k: cg.Key): cg.Pos => {
  const shift = parseInt(k.slice(1));
  const diff = (shift - 1) * 0.5;
  if (parseInt(k.slice(1)) < 5) {
    return [k.charCodeAt(0) - 96 + 2 - diff, parseInt(k.slice(1))] as cg.Pos;
  }
  return [k.charCodeAt(0) - 96 - (diff - 5) - 3, parseInt(k.slice(1))] as cg.Pos;
};

const shift = [2, 1.5, 1, 0.5, 0, -0.5, -1, -1.5, -2];

// @TODO VFR: translateBase should probably be in transformations.ts
// @TODO VFR: probably need to adapt the code here still anyway
const translateBase: Record<cg.Orientation, cg.TranslateBase> = {
  p1: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
    (pos[0] - 1 + shift[pos[1] - 1]) * xScale,
    (bt.height - pos[1]) * yScale,
  ],
  p2: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
    (bt.width - pos[0] - shift[pos[1] - 1]) * xScale,
    (pos[1] - 1) * yScale,
  ],
  right: (pos: cg.Pos, xScale: number, yScale: number, _) => [(pos[1] - 1) * xScale, (pos[0] - 1) * yScale],
  left: (pos: cg.Pos, xScale: number, yScale: number, bt: cg.BoardDimensions) => [
    (bt.width - pos[0]) * xScale,
    (pos[1] - 1) * yScale,
  ],
  p1vflip: (pos: cg.Pos, xScale: number, yScale: number, _) => [(pos[0] - 1) * xScale, (pos[1] - 1) * yScale],
};

export const posToTranslateAbs = (
  pos: cg.Pos,
  orientation: cg.Orientation,
  xFactor: number,
  yFactor: number,
  bt: cg.BoardDimensions,
): cg.NumberPair => {
  return translateBase[orientation](pos, xFactor, yFactor, bt);
};

export const posToTranslateRel = (pos: cg.Pos, orientation: cg.Orientation, bt: cg.BoardDimensions): cg.NumberPair => {
  return translateBase[orientation](pos, 100, 100, bt);
};

export const translateAbs = (el: HTMLElement, pos: cg.NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

function files(n: number) {
  return abaloneFiles.slice(0, n);
}

function ranks(n: number) {
  return abaloneRanks.slice(0, n);
}

export function allKeys(bd: cg.BoardDimensions = { width: 9, height: 9 }) {
  return Array.prototype.concat(...files(bd.width).map(c => ranks(bd.height).map(r => c + r)));
}

export const allPos = (bd: cg.BoardDimensions): cg.Pos[] => allKeys(bd).map(key2pos);

export function computeSquareCenter(
  key: cg.Key,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): cg.NumberPair {
  const pos = T.mapToP1Inverse[orientation](key2pos(key), bd);
  return [
    bounds.left + (bounds.width * (pos[0] + shift[pos[1] - 1] - 1 + 0.5)) / bd.width,
    bounds.top + (bounds.height * (bd.height - (pos[1] - 1 + 0.5))) / bd.height,
  ];
}
