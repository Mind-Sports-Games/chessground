import type * as cg from '../../types';

import {
  candidateLineDirs,
  deducePotentialSideDirs,
  move,
  getDirectionString,
  isMoveInLine,
  DiagonalDirectionString,
  inverseDirection,
} from './directions';
import type { MoveImpact, MoveVector } from './types';

// compute the impact of a move on the board before it is made
export const computeMoveImpact = (pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): MoveImpact | undefined => {
  const directionString = getDirectionString(orig, dest);
  if (!directionString) return undefined;
  const isAMoveInLine = isMoveInLine(orig, dest, directionString);
  const diff: cg.PiecesDiff = new Map(pieces);

  if (isAMoveInLine) {
    diff.set(dest, pieces.get(orig));
    diff.set(orig, undefined);
    if (!pieces.get(dest)) {
      // line move
      return {
        diff,
        capture: false,
        moveVector: {
          directionString,
          landingSquares: [dest],
        },
      };
    }
    // push move
    const landingSquare1 = move(dest, directionString);
    if (landingSquare1 === undefined)
      // xxo\ xxxo\
      return {
        diff,
        capture: true,
        moveVector: {
          directionString,
          landingSquares: [dest],
        },
      };
    if (!pieces.get(landingSquare1)) {
      // xxo. xxxo.
      diff.set(landingSquare1, pieces.get(dest));
      return {
        diff,
        capture: false,
        moveVector: {
          directionString,
          landingSquares: [dest, landingSquare1],
        },
      };
    }

    const landingSquare2 = move(landingSquare1, directionString);
    if (landingSquare2 === undefined)
      // xxxoo\
      return {
        diff,
        capture: true,
        moveVector: {
          directionString,
          landingSquares: [dest, landingSquare1],
        },
      };
    if (!pieces.get(landingSquare2)) {
      // xxxoo.
      diff.set(landingSquare2, pieces.get(dest));
      return {
        diff,
        capture: false,
        moveVector: {
          directionString,
          landingSquares: [dest, landingSquare2],
        },
      };
    }
  }

  // side move
  for (const lineDir of candidateLineDirs(directionString as DiagonalDirectionString)) {
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
            return {
              diff,
              capture: false,
              moveVector: {
                directionString: sideDir,
                landingSquares: [side1stPos, dest],
              },
            };
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
              return {
                diff,
                capture: false,
                moveVector: {
                  directionString: sideDir,
                  landingSquares: [side1stPos, side2ndPos, side3rdPos],
                },
              };
            }
          }
        }
      }
    }
  }

  return undefined;
};

// compute a move vector after a move has been made
export const computeMoveVectorPostMove = (pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): MoveVector | undefined => {
  const directionString = getDirectionString(dest, orig);
  if (!directionString) return undefined;
  const isAMoveInLine = isMoveInLine(dest, orig, directionString);
  const inverseDirectionString = inverseDirection(directionString);

  if (isAMoveInLine) {
    return {
      directionString: inverseDirectionString,
      landingSquares: [dest],
    };
  }

  // side move
  for (const lineDir of candidateLineDirs(directionString as DiagonalDirectionString)) {
    const sideDirs = deducePotentialSideDirs(directionString as DiagonalDirectionString, lineDir);
    const secondPos = move(dest, lineDir);
    if (secondPos === undefined) continue;
    for (const sideDir of sideDirs) {
      const side2ndPos = move(secondPos, sideDir);
      if (side2ndPos) {
        const side1stPos = move(dest, sideDir);
        if (side1stPos === undefined) continue;
        if (side1stPos && pieces.get(secondPos)) {
          if (side2ndPos === orig) {
            return {
              directionString: inverseDirection(sideDir),
              landingSquares: [secondPos, dest],
            };
          } else {
            // 3 marbles are moving
            const thirdPos = move(secondPos, lineDir);
            if (thirdPos === undefined) continue;
            const side3rdPos = move(thirdPos, sideDir);
            if (side3rdPos === undefined) continue;
            if (pieces.get(thirdPos) && side3rdPos === orig) {
              return {
                directionString: inverseDirection(sideDir),
                landingSquares: [secondPos, thirdPos, dest],
              };
            }
          }
        }
      }
    }
  }

  return undefined;
};
