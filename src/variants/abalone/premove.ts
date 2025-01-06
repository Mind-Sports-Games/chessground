import type * as cg from '../../types';

import { DiagonalDirectionString, HorizontalDirectionString, listPotentialSideDirs, move } from './directions';
import type { DirectionString } from './types';

export const premove = (
  pieces: cg.Pieces,
  key: cg.Key,
  _canCastle: boolean,
  _bd: cg.BoardDimensions,
  _variant: cg.Variant,
  _chess960: boolean,
): cg.Key[] => {
  return validDestinations(pieces, key);
}

export const validDestinations = (pieces: cg.Pieces, orig: cg.Key): cg.Key[] => {
  const dests: cg.Key[] = [];
  const directions: DirectionString[] = [
    ...Object.values(DiagonalDirectionString),
    ...Object.values(HorizontalDirectionString),
  ];

  for (const direction of directions) {
    const dest = move(orig, direction);
    if (!dest) continue; // x\

    if (!pieces.get(dest)) {
      dests.push(dest); // x.
      continue;
    }

    if (pieces.get(dest)?.playerIndex !== pieces.get(orig)?.playerIndex) continue; // xo

    // xx
    // side move of 2 marbles
    const sideDirections = listPotentialSideDirs(direction);
    for (const sideDir of sideDirections) {
      const sideDestMarble1 = move(orig, sideDir);
      const sideDestMarble2 = move(dest, sideDir);
      if (sideDestMarble1 && !pieces.get(sideDestMarble1) && sideDestMarble2 && !pieces.get(sideDestMarble2)) {
        dests.push(sideDestMarble2);
      }
    }

    // then now if the direction of the line is pointing toward a non existing square, we can continue with next directions
    const dest2 = move(dest, direction);
    if (!dest2) continue; // xx\

    if (!pieces.get(dest2)) {
      // xx.
      dests.push(dest2);
      continue;
    }

    const dest3 = move(dest2, direction); // xx_?
    // push of 2 marbles
    if (pieces.get(dest2) && pieces.get(dest2)?.playerIndex !== pieces.get(orig)?.playerIndex) {
      // xxo
      if (!dest3) {
        // xxo\
        dests.push(dest2);
        continue;
      }
      if (!pieces.get(dest3)) {
        // xxo.
        dests.push(dest2);
      }
      continue; // we do not need to consider any further move as it's xxo
    }

    // we know we now have xxx, because we covered the cases of xx\ xx. xxo

    // let's compute side moves
    const sideDirs = listPotentialSideDirs(direction);
    for (const sideDir of sideDirs) {
      const sideDestMarble1 = move(orig, sideDir);
      const sideDestMarble2 = move(dest, sideDir);
      const sideDestMarble3 = move(dest2, sideDir);
      if (
        sideDestMarble1 &&
        !pieces.get(sideDestMarble1) &&
        sideDestMarble2 &&
        !pieces.get(sideDestMarble2) &&
        sideDestMarble3 &&
        !pieces.get(sideDestMarble3)
      ) {
        dests.push(sideDestMarble3);
      }
    }

    if (!dest3) continue; // xxx\

    if (!pieces.get(dest3)) {
      // xxx.
      dests.push(dest3);
      continue;
    }

    if (pieces.get(dest3)?.playerIndex === pieces.get(orig)?.playerIndex) {
      // xxxx
      continue;
    }

    // xxxo
    const dest4 = move(dest3, direction);
    if (!dest4) {
      // xxxo\
      dests.push(dest3);
      continue;
    }
    if (!pieces.get(dest4)) {
      // xxxo.
      dests.push(dest3);
      continue;
    }
    if (pieces.get(dest4)?.playerIndex === pieces.get(orig)?.playerIndex) {
      // xxxox
      continue;
    }

    // xxxoo
    const dest5 = move(dest4, direction);
    if (!dest5) {
      // xxxoo\
      dests.push(dest3);
      continue;
    }
    if (!pieces.get(dest5)) {
      // xxxoo.
      dests.push(dest3);
    }
  }

  return dests;
};
