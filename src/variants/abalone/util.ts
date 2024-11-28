import * as cg from '../../types';
import * as T from '../../transformations';
import { candidateLineDirs, deducePotentialSideDirs, move, getDirectionString, isMoveInLine } from './directions';
import type { DiagonalDirectionString } from './directions';

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

export const abaloneUpdatePiecesFromMove = (
  pieces: cg.Pieces,
  orig: cg.Key,
  dest: cg.Key,
): [cg.PiecesDiff, boolean] => {
  const directionString = getDirectionString(orig, dest);
  if (!directionString) return [pieces, false];
  const isAMoveInLine = isMoveInLine(orig, dest, directionString);
  const diff: cg.PiecesDiff = new Map(pieces);

  if (isAMoveInLine) {
    diff.set(dest, pieces.get(orig));
    diff.set(orig, undefined);
    if (!pieces.get(dest)) {
      // line move
      return [diff, false];
    }
    // push move
    const landingSquare1 = move(dest, directionString);
    if (landingSquare1 === undefined) return [diff, true]; // xxo\ xxxo\
    if (!pieces.get(landingSquare1)) {
      // xxo. xxxo.
      diff.set(landingSquare1, pieces.get(dest));
      return [diff, false];
    }

    const landingSquare2 = move(landingSquare1, directionString);
    if (landingSquare2 === undefined) return [diff, true]; // xxxoo\
    if (!pieces.get(landingSquare2)) {
      // xxxoo.
      diff.set(landingSquare2, pieces.get(dest));
      return [diff, false];
    }
  }

  // side move
  const overAllDirection = directionString as DiagonalDirectionString;
  for (const lineDir of candidateLineDirs(overAllDirection as DiagonalDirectionString)) {
    const sideDirs = deducePotentialSideDirs(directionString as DiagonalDirectionString, lineDir);
    const secondPos = move(orig, lineDir);
    if (secondPos === undefined) continue;
    for (const sideDir of sideDirs) {
      const side2ndPos = move(secondPos, sideDir);
      if (side2ndPos) {
        const side1stPos = move(orig, sideDir);
        if (side1stPos === undefined) continue;
        if (side1stPos && pieces.get(secondPos)) {
          if (side2ndPos === dest) {
            diff.set(side1stPos, pieces.get(orig));
            diff.set(orig, undefined);
            diff.set(dest, pieces.get(secondPos));
            diff.set(secondPos, undefined);
            return [diff, false];
          } else {
            // 3 marbles are moving
            const thirdPos = move(secondPos, lineDir);
            if (thirdPos === undefined) continue;
            const side3rdPos = move(thirdPos, sideDir);
            if (side3rdPos === undefined) continue;
            if (pieces.get(thirdPos) && side3rdPos === dest) {
              diff.set(side1stPos, pieces.get(orig));
              diff.set(orig, undefined);
              diff.set(side2ndPos, pieces.get(secondPos));
              diff.set(secondPos, undefined);
              diff.set(side3rdPos, pieces.get(thirdPos));
              diff.set(thirdPos, undefined);
              return [diff, false];
            }
          }
        }
      }
    }
  }

  return [diff, false];
};
