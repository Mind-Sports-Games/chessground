import * as cg from './types';
import * as T from './transformations';

export const playerIndexs: cg.PlayerIndex[] = ['p1', 'p2'];
export const invRanks: readonly cg.Rank[] = [...cg.ranks19].reverse();
export const NRanks: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
export const invNRanks: number[] = [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function files(n: number) {
  return cg.files.slice(0, n);
}

function ranks(n: number) {
  return cg.ranks19.slice(0, n);
}

export function allKeys(bd: cg.BoardDimensions = { width: 8, height: 8 }) {
  return Array.prototype.concat(...files(bd.width).map(c => ranks(bd.height).map(r => c + r)));
}

export function pos2key(pos: cg.Pos): cg.Key {
  return (cg.files[pos[0] - 1] + cg.ranks19[pos[1] - 1]) as cg.Key;
}

export function key2pos(k: cg.Key): cg.Pos {
  return [k.charCodeAt(0) - 96, parseInt(k.slice(1))] as cg.Pos;
}

export const allPos = (bd: cg.BoardDimensions): cg.Pos[] => allKeys(bd).map(key2pos);

export function adjacentKeys(bd: cg.BoardDimensions, key: cg.Key): cg.Key[] {
  const pos = key2pos(key);
  const adjacentSquares = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  return adjacentSquares
    .map(offset => [pos[0] + offset[0], pos[1] + offset[1]])
    .filter(p => p[0] > 0 && p[0] <= bd.width && p[1] > 0 && p[1] <= bd.height)
    .map(p => pos2key(p as cg.Pos));
}

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

export const opposite = (c: cg.PlayerIndex): cg.PlayerIndex => (c === 'p1' ? 'p2' : 'p1');

const flipOrientationLookup: Record<cg.Orientation, cg.Orientation> = {
  p1: 'p2',
  p2: 'p1',
  left: 'right',
  right: 'left',
};
export const oppositeOrientation = (c: cg.Orientation): cg.Orientation => flipOrientationLookup[c];
const flipOrientationLookupForLOA: Record<cg.PlayerIndex, cg.Orientation> = {
  p1: 'right',
  p2: 'p1',
};
export const oppositeOrientationForLOA = (c: cg.PlayerIndex): cg.Orientation => flipOrientationLookupForLOA[c];
const orientationLookupForLOA: Record<cg.PlayerIndex, cg.Orientation> = {
  p1: 'p1',
  p2: 'right',
};
export const orientationForLOA = (c: cg.PlayerIndex): cg.Orientation => orientationLookupForLOA[c];
export const isPlayerIndex = (c: cg.Orientation): c is cg.PlayerIndex => c === 'p1' || c === 'p2';

export function containsX<X>(xs: X[] | undefined, x: X): boolean {
  return xs !== undefined && xs.indexOf(x) !== -1;
}

export const distanceSq = (pos1: cg.Pos, pos2: cg.Pos): number => {
  const dx = pos1[0] - pos2[0],
    dy = pos1[1] - pos2[1];
  return dx * dx + dy * dy;
};

export const samePiece = (player1: cg.Piece, player2: cg.Piece): boolean => {
  return player1.role === player2.role && player1.playerIndex === player2.playerIndex;
};

const posToTranslateBase = (
  pos: cg.Pos,
  orientation: cg.Orientation,
  xFactor: number,
  yFactor: number,
  bt: cg.BoardDimensions
): cg.NumberPair => {
  return T.translateBase[orientation](pos, xFactor, yFactor, bt);
};

export const posToTranslateAbs = (
  bounds: ClientRect,
  bt: cg.BoardDimensions
): ((pos: cg.Pos, orientation: cg.Orientation) => cg.NumberPair) => {
  const xFactor = bounds.width / bt.width,
    yFactor = bounds.height / bt.height;
  return (pos, orientation) => posToTranslateBase(pos, orientation, xFactor, yFactor, bt);
};

export const posToTranslateRel = (
  pos: cg.Pos,
  orientation: cg.Orientation,
  bt: cg.BoardDimensions,
  v: cg.Variant
): cg.NumberPair => posToTranslateBase(pos, orientation, 100, v === 'togyzkumalak' ? 150 : 100, bt);

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

export function computeSquareCenter(
  key: cg.Key,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions
): cg.NumberPair {
  const pos = T.mapToP1Inverse[orientation](key2pos(key), bd);
  return [
    bounds.left + (bounds.width * (pos[0] - 1 + 0.5)) / bd.width,
    bounds.top + (bounds.height * (bd.height - (pos[1] - 1 + 0.5))) / bd.height,
  ];
}

export function calculatePlayerEmptyAreas(
  pieces: cg.Pieces,
  bd: cg.BoardDimensions,
  deadStones: cg.Pieces
): Map<cg.Key, cg.PlayerIndex> {
  const emptySquares: cg.Key[] = allKeys(bd).filter(key => !pieces.has(key) || deadStones.has(key));
  const piecesToConsider = new Map<cg.Key, cg.Piece>();
  pieces.forEach((piece: cg.Piece, key: cg.Key) => {
    piecesToConsider.set(key, piece);
  });
  deadStones.forEach((_: cg.Piece, key: cg.Key) => {
    piecesToConsider.delete(key);
  });
  const areas: cg.Key[][] = calculateAreas(emptySquares, bd);

  const playerAreas = new Map<cg.Key, cg.PlayerIndex>();

  for (const area of areas) {
    const borderKeys = calculateBorder(area, bd);
    const surroundingPlayers = new Set(borderKeys.map(k => piecesToConsider.get(k)?.playerIndex));
    if (surroundingPlayers.size === 1) {
      for (const k of area) {
        if (!Array.from(deadStones.keys()).includes(k)) {
          playerAreas.set(k, surroundingPlayers.has('p1') ? 'p1' : 'p2');
        }
      }
    }
  }

  return playerAreas;
}

export function calculateBorder(squares: cg.Key[], bd: cg.BoardDimensions): cg.Key[] {
  return squares.flatMap(k => adjacentKeys(bd, k)).filter(k => !squares.includes(k));
}

export function calculateAreas(emptySquares: cg.Key[], bd: cg.BoardDimensions): cg.Key[][] {
  function assignNextWave(squaresToBeAssigned: cg.Key[], emptyAreas: cg.Key[][]): cg.Key[][] {
    const emptySquaresToAdd = squaresToBeAssigned.filter(stba =>
      emptyAreas
        .slice(0, 1)
        .flat()
        .flatMap(s => adjacentKeys(bd, s))
        .includes(stba)
    );
    const updatedEmptyAreas =
      emptySquaresToAdd.length === 0
        ? [squaresToBeAssigned.slice(0, 1)].concat(emptyAreas)
        : [emptyAreas.slice(0, 1).flat().concat(emptySquaresToAdd)].concat(emptyAreas.slice(1));

    const updatedSquaresToBeAssigned = squaresToBeAssigned.filter(s => !updatedEmptyAreas.flat().includes(s));

    if (updatedSquaresToBeAssigned.length > 0) {
      return assignNextWave(updatedSquaresToBeAssigned, updatedEmptyAreas);
    } else {
      return updatedEmptyAreas;
    }
  }

  return assignNextWave(emptySquares.slice(1), [emptySquares.slice(0, 1)]);
}

export function calculatePieceGroup(pieceKey: cg.Key, pieces: cg.Pieces, bd: cg.BoardDimensions): cg.Key[] {
  function assignNextWave(pieceGroup: cg.Key[]): cg.Key[] {
    const borderKeys = calculateBorder(pieceGroup, bd);
    const newKeys = borderKeys.filter(
      k => pieces.get(k) && pieces.get(k)?.playerIndex === pieces.get(pieceKey)?.playerIndex
    );
    if (newKeys.length > 0) {
      return assignNextWave(pieceGroup.concat(newKeys));
    } else {
      return pieceGroup;
    }
  }

  return assignNextWave([pieceKey]);
}

export type Callback = (...args: any[]) => void;

export function callUserFunction(f: Callback | undefined, ...args: any[]): void {
  if (f) setTimeout(() => f(...args), 1);
}
