import { roles } from '../../fen';
import * as cg from '../../types';
import { pos2key } from '../../util';

export const read = (fen: cg.FEN, dimensions: cg.BoardDimensions): cg.Pieces => {
  const pieces: cg.Pieces = new Map();

  let row: number = dimensions.height;
  const padding = [0, 0, 0, 0, 0, 0, 1, 2, 3, 4];
  let file = padding[row];

  for (let i = 0; i < fen.length; i++) {
    const c = fen[i];
    if (c === ' ') break;
    else if (c == '/') {
      file = padding[row - 1];
      --row;
    } else {
      const step = parseInt(c, 10);
      if (step > 0) {
        file += step;
      } else {
        file++;
        const letter = c.toLowerCase();
        const playerIndex = (c === letter ? 'p2' : 'p1') as cg.PlayerIndex;
        const piece = {
          role: roles(letter),
          playerIndex: playerIndex,
        } as cg.Piece;
        pieces.set(pos2key([file, row]), piece); // @TODO VFR: check all cases are correctly handled to prevent a js error in console
      }
    }
  }

  return pieces;
};
