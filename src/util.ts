import * as cg from './types';
import * as T from './transformations';

export const colors: cg.Color[] = ['white', 'black'];

export const NRanks: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
export const invRanks: number[] = [10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function files(n: number) {
  return cg.files.slice(0, n);
}

function ranks(n: number) {
  return cg.ranks.slice(0, n);
}

export function allKeys(geom: cg.Geometry) {
  const bd = cg.dimensions[geom];
  return Array.prototype.concat(...files(bd.width).map(c => ranks(bd.height).map(r => c+r)));
}

export function pos2key(pos: cg.Pos) {
  return (cg.files[pos[0] - 1] + cg.ranks[pos[1] - 1]) as cg.Key;
}

export function key2pos(k: cg.Key) {
  return [k.charCodeAt(0) - 96, k.charCodeAt(1) - 48] as cg.Pos;
}

export const allPos = (geom : cg.Geometry): cg.Pos[] => (allKeys(geom).map(key2pos));

export function memo<A>(f: () => A): cg.Memo<A> {
  let v: A | undefined;
  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => {
    v = undefined;
  };
  return ret;
}

export const timer = (): cg.Timer => {
  let startAt: number | undefined;
  return {
    start() {
      startAt = performance.now();
    },
    cancel() {
      startAt = undefined;
    },
    stop() {
      if (!startAt) return 0;
      const time = performance.now() - startAt;
      startAt = undefined;
      return time;
    },
  };
};

export const opposite = (c: cg.Color): cg.Color => (c === 'white' ? 'black' : 'white');

const flipOrientationLookup: Record<cg.Orientation, cg.Orientation> = {
  white: 'black',
  black: 'white',
  left: 'right',
  right: 'left',
};
export const oppositeOrientation = (c: cg.Orientation): cg.Orientation => flipOrientationLookup[c];
const flipOrientationLookupForLOA: Record<cg.Color, cg.Orientation> = {
  white: 'right',
  black: 'white',
};
export const oppositeOrientationForLOA = (c: cg.Color): cg.Orientation => flipOrientationLookupForLOA[c];
const orientationLookupForLOA: Record<cg.Color, cg.Orientation> = {
  white: 'white',
  black: 'right',
};
export const orientationForLOA = (c: cg.Color): cg.Orientation => orientationLookupForLOA[c];
export const isColor = (c: cg.Orientation): c is cg.Color => c === 'white' || c === 'black';

export function containsX<X>(xs: X[] | undefined, x: X): boolean {
  return xs !== undefined && xs.indexOf(x) !== -1;
}

export const distanceSq = (pos1: cg.Pos, pos2: cg.Pos): number => {
  const dx = pos1[0] - pos2[0],
    dy = pos1[1] - pos2[1];
  return dx * dx + dy * dy;
};

export const samePiece = (p1: cg.Piece, p2: cg.Piece): boolean => p1.role === p2.role && p1.color === p2.color;

const posToTranslateBase = (
  pos: cg.Pos,
  asWhite: boolean,
  orientation: cg.Orientation,
  xFactor: number,
  yFactor: number,
  bt: cg.BoardDimensions
): cg.NumberPair => {
  return T.translateBase[orientation](pos, xFactor, yFactor, asWhite, bt);
};


export const posToTranslateAbs = (
  bounds: ClientRect,
  bt: cg.BoardDimensions
): ((pos: cg.Pos, orientation: cg.Orientation, asWhite: boolean) => cg.NumberPair) => {
  const xFactor = bounds.width / bt.width,
    yFactor = bounds.height / bt.height;
  return (pos, orientation, asWhite: boolean) => posToTranslateBase(pos, asWhite, orientation, xFactor, yFactor, bt);
};


export const posToTranslateRel = (pos: cg.Pos, orientation: cg.Orientation, asWhite: boolean, bt: cg.BoardDimensions ): cg.NumberPair =>
  posToTranslateBase(pos, asWhite, orientation, 100, 100, bt);


export const translateAbs = (el: HTMLElement, pos: cg.NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateRel = (el: HTMLElement, percents: cg.NumberPair): void => {
  el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
};

export const setVisible = (el: HTMLElement, v: boolean): void => {
  el.style.visibility = v ? 'visible' : 'hidden';
};

export const eventPosition = (e: cg.MouchEvent): cg.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};

export const isRightButton = (e: cg.MouchEvent): boolean => e.buttons === 2 || e.button === 2;

export const createEl = (tagName: string, className?: string): HTMLElement => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export function computeSquareCenter(key: cg.Key, orientation: cg.Orientation, bounds: ClientRect): cg.NumberPair {
  const pos = T.mapToWhiteInverse[orientation](key2pos(key));
  return [
    bounds.left + (bounds.width * pos[0]) / 8 + bounds.width / 16,
    bounds.top + (bounds.height * (7 - pos[1])) / 8 + bounds.height / 16,
  ];
}
