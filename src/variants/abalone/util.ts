import {
  BoardDimensions,
  files,
  Key,
  NumberPair,
  Orientation,
  Piece,
  PlayerIndex,
  Pos,
  ranks19,
  Variant,
} from '../../types';
import { SquareDimensions } from './types';

export const getBoardSize = (variant: Variant): BoardDimensions => {
  switch (variant) {
    default:
    case 'abalone':
      return { width: 9, height: 9 };
    case 'grandabalone':
      return { width: 11, height: 11 };
  }
};

export const isUsable = (_variant: Variant, piece: Piece, player: PlayerIndex): boolean => {
  return piece.playerIndex === player;
};
export const isPushable = (variant: Variant, piece: Piece, player: PlayerIndex): boolean => {
  return isEjectable(variant, piece, player);
};
export const isEjectable = (_variant: Variant, piece: Piece, player: PlayerIndex): boolean => {
  return piece.playerIndex !== player;
};

export const getMaxUsable = (variant: Variant): number | undefined => {
  switch (variant) {
    default:
      return undefined;
    case 'abalone':
      return 3;
    case 'grandabalone':
      return 4;
  }
};
export const getWinningScore = (variant: Variant): number => {
  switch (variant) {
    default:
    case 'abalone':
      return 6;
    case 'grandabalone':
      return 10;
  }
};
export const hasPrevPlayer = (variant: Variant): boolean => {
  switch (variant) {
    default:
    case 'abalone':
      return false;
    case 'grandabalone':
      return true;
  }
};

export const getCellList = (variant: Variant): Pos[] => {
  const size = getBoardSize(variant);
  const res: Pos[] = [];

  for (let y = size.height - 1; y >= 0; y--) {
    for (let x = 0; x < size.width; x++) {
      const pos: Pos = [x, y];
      if (isCellCore(size, pos)) res.push(pos);
    }
  }

  return res;
};

export const pos2key = (pos: Pos): Key => {
  return (files[pos[1]] + ranks19[pos[0]]) as Key;
};

export const key2pos = (k: Key): Pos => {
  return [parseInt(k.slice(1)) - 1, k.charCodeAt(0) - 97] as Pos;
};

export const posToTranslateRel = (variant: Variant, pos: Pos, _orientation: Orientation): NumberPair => {
  return cellToDrawn(variant, pos); //TODO shouldn't it depend on the orientation?
};

export const translateAbs = (el: HTMLElement, pos: NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateRel = (el: HTMLElement, percents: NumberPair): void => {
  el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
};

export const posToTranslateAbs = (
  variant: Variant,
  bounds: ClientRect,
  pos: Pos,
  orientation: Orientation,
): NumberPair => {
  let res = cellToPxrel(variant, bounds, pos);

  if (orientation == 'p2') {
    res = mult(-1, res);
  }

  return pxrelToPx(variant, bounds, res);
};

export const getSquareDimensions = (_variant: Variant, bounds: ClientRect): SquareDimensions => {
  return {
    width: 1.028 * bounds.width * 0.091,
    height: 1.02 * bounds.height * 0.0788,
  };
};

const getFactor = (variant: Variant): number => {
  return variant === 'grandabalone' ? 0.865 : 1;
};

//
// Drawn
const bottomLeft = [295, 854] as Pos;

export const drawnToBasic = (_variant: Variant, pos: Pos): Pos => {
  return sub(div(100, pos), bottomLeft);
};
export const drawnToCell = (variant: Variant, pos: Pos): Pos => {
  return basicToCell(drawnToBasic(variant, pos));
};

//
// Basic
export const basicToDrawn = (_variant: Variant, pos: Pos): Pos => {
  return add(bottomLeft, mult(100, pos));
};
export const basicToCell = (pos: Pos): Pos => {
  const res = [pos[0] + pos[1] / sr3, (pos[1] * 2) / sr3];
  return [Math.round(res[0]), Math.round(res[1])];
};

//
// Px
export const pxToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  const d = getSquareDimensions(variant, bounds).width / 2;
  return sub(add(pos, [d, d]), div(2, [bounds.width, bounds.height]));
};
export const pxToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pxrelToP(variant, bounds, pxToPxrel(variant, bounds, pos));
};
export const pxToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pxrelToCellrel(variant, bounds, pxToPxrel(variant, bounds, pos));
};
export const pxToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pxrelToCell(variant, bounds, pxToPxrel(variant, bounds, pos));
};

//
// Pxrel
export const pxrelToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  const d = getSquareDimensions(variant, bounds).width / 2;
  return sub(add(div(2, [bounds.width, bounds.height]), pos), [d, d]);
};
export const pxrelToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  const d = getSquareDimensions(variant, bounds);
  const f = getFactor(variant);
  return div2(d.width * f, d.height * f, pos);
};
export const pxrelToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pToCellrel(variant, bounds, pxrelToP(variant, bounds, pos));
};
export const pxrelToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pToCell(variant, bounds, pxrelToP(variant, bounds, pos));
};

//
// P
export const pToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pxrelToPx(variant, bounds, pToPxrel(variant, bounds, pos));
};
export const pToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  const d = getSquareDimensions(variant, bounds);
  const f = getFactor(variant);
  return mult2(d.width * f, d.height * f, pos);
};
export const pToCellrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return cellrelToP(variant, bounds, pos); // Involution
};
export const pToCell = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return cellrelToCell(variant, bounds, pToCellrel(variant, bounds, pos));
};

//
// Cellrel
export const cellrelToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pToPx(variant, bounds, cellrelToP(variant, bounds, pos));
};
export const cellrelToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return pToPxrel(variant, bounds, cellrelToP(variant, bounds, pos));
};
export const cellrelToP = (_variant: Variant, _bounds: ClientRect, pos: Pos): NumberPair => {
  return [pos[0] - pos[1] / 2, -pos[1]];
};
export const cellrelToCell = (variant: Variant, _bounds: ClientRect, pos: Pos): NumberPair => {
  const res = add(pos, getCentre(variant));
  return [Math.round(res[0]), Math.round(res[1])];
};

//
// Cell
export const cellToPx = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return cellrelToPx(variant, bounds, cellToCellrel(variant, bounds, pos));
};
export const cellToPxrel = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return cellrelToPxrel(variant, bounds, cellToCellrel(variant, bounds, pos));
};
export const cellToP = (variant: Variant, bounds: ClientRect, pos: Pos): NumberPair => {
  return cellrelToP(variant, bounds, cellToCellrel(variant, bounds, pos));
};
export const cellToCellrel = (variant: Variant, _bounds: ClientRect, pos: Pos): NumberPair => {
  return sub(pos, getCentre(variant));
};

export const cellToDrawn = (variant: Variant, pos: Pos): Pos => {
  return basicToDrawn(variant, cellToBasic(variant, pos));
};
export const cellToBasic = (_variant: Variant, pos: Pos): Pos => {
  return vectTo3(pos);
};

export const sr3 = Math.sqrt(3);

export const getCentre = (variant: Variant): Pos => {
  return getCentreCore(getBoardSize(variant));
};
export const getCentreCore = (d: BoardDimensions): Pos => {
  return [Math.floor(d.width / 2), Math.floor(d.height / 2)];
};

export const isCell = (variant: Variant, pos: Pos): boolean => {
  return isCellCore(getBoardSize(variant), pos);
};
const isCellCore = (d: BoardDimensions, pos: Pos): boolean => {
  const centre = getCentreCore(d);
  return dist(centre, pos) <= centre[0];
};

//
// Geometry
export const add = (a: Pos, b: Pos): Pos => {
  return [a[0] + b[0], a[1] + b[1]];
};
export const sub = (a: Pos, b: Pos): Pos => {
  return add(a, mult(-1, b));
};
export const mult = (n: number, a: Pos): Pos => {
  return mult2(n, n, a);
};
export const mult2 = (n: number, p: number, a: Pos): Pos => {
  return [n * a[0], p * a[1]];
};
export const div = (n: number, a: Pos): Pos => {
  return mult(1 / n, a);
};
export const div2 = (n: number, p: number, a: Pos): Pos => {
  return mult2(1 / n, 1 / p, a);
};

export const areEqual = (a: Pos, b: Pos): boolean => {
  return a[0] === b[0] && a[1] === b[1];
};
export const round = (a: Pos): Pos => {
  return [Math.round(a[0]), Math.round(a[1])];
};
export const vectTo3 = (a: Pos): Pos => {
  return [a[0] - a[1] / 2, (a[1] * sr3) / 2];
};
export const vectFrom3 = (a: Pos): Pos => {
  return [a[0] + a[1] / sr3, (a[1] * 2) / sr3];
};
export const cross = (a: Pos, b: Pos): number => {
  return a[0] * b[1] - a[1] * b[0];
};

export const getRotated = (a: Pos, deg: number): Pos => {
  const rot = (deg * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  return [cos * a[0] - sin * a[1], sin * a[0] + cos * a[1]];
};
export const getRotatedKeepNorm = (a: Pos, deg: number): Pos => {
  const p = round(vectFrom3(getRotated(vectTo3(a), deg)));
  let n = norm(p);
  if (n > 0) {
    n = norm(a) / n;
  }

  return mult(n, p);
};
export const getPrev = (vect: Pos): Pos => {
  return getPrevCore(getNeighVectors(), vect);
};
export const getPrevCore = (neighVectors: Pos[], vect: Pos): Pos => {
  return getRotatedKeepNorm(vect, -360 / neighVectors.length);
};
export const getNext = (vect: Pos): Pos => {
  return getNextCore(getNeighVectors(), vect);
};
export const getNextCore = (neighVectors: Pos[], vect: Pos): Pos => {
  return getRotatedKeepNorm(vect, 360 / neighVectors.length);
};

export const getAngle = (a: Pos): number => {
  return (Math.atan2(a[1], a[0]) * 180) / Math.PI;
};
export const getAngle360 = (a: Pos): number => {
  return rest(getAngle(a), 360);
};
export const rest = (todiv: number, divby: number): number => {
  let res = todiv % divby;

  if (res < 0) res += divby > 0 ? divby : -divby;
  //if (res === -0) res = 0;
  if (res < 0) res = 0;

  return res;
};
export const divint = (todiv: number, divby: number): number => {
  let res = todiv / divby;
  if (todiv < 0 && todiv % divby != 0) res += divby > 0 ? -1 : 1;

  return res;
};

export const dist = (pos0: Pos, pos1: Pos): number => {
  return normCore(pos0[0] - pos1[0], pos0[1] - pos1[1]);
};
export const norm = (pos: Pos): number => {
  return normCore(pos[0], pos[1]);
};
export const normCore = (x: number, y: number): number => {
  return x * y < 0 ? Math.abs(x) + Math.abs(y) : Math.max(Math.abs(x), Math.abs(y));
};

export const dist2 = (pos0: Pos, pos1: Pos): number => {
  return norm2Core(pos0[0] - pos1[0], pos0[1] - pos1[1]);
};
export const norm2 = (pos: Pos): number => {
  return norm2Core(pos[0], pos[1]);
};
export const norm2Core = (x: number, y: number): number => {
  return Math.sqrt(x * x + y * y);
};

const normRadius = 1;
export const getNeighVectors = (): Pos[] => {
  const res = [];

  for (let i = -normRadius; i <= normRadius; i++) {
    for (let j = -normRadius; j <= normRadius; j++) {
      if (normCore(i, j) === 1) {
        res.push([i, j] as Pos);
      }
    }
  }

  return res;
};
export const includes = (positions: Pos[], pos: Pos): boolean => {
  for (const p of positions) {
    if (p[0] === pos[0] && p[1] === pos[1]) return true;
  }
  return false;
};
