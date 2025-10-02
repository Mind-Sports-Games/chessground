import { getCellList, pos2key } from './util';
import { roles } from '../../fen';
import { FEN, Pieces, PlayerIndex, Pos, Variant } from '../../types';

export const read = (variant: Variant, fen: FEN): Pieces => {
  const res: Pieces = new Map();
  const cells: Pos[] = getCellList(variant);

  var k = 0;
  for (let i = 0; i < fen.length; i++) {
    const c = fen[i];
    if (c === ' ') break;
    else if (c != '/') {
      const steps = parseInt(c);

      if (steps > 0) k += steps;
      else {
        const letter = c.toLowerCase();
        const playerIndex = (c === c.toLowerCase() ? 'p2' : 'p1') as PlayerIndex;

        res.set(pos2key(cells[k]), {
          role: roles(letter),
          playerIndex: playerIndex,
        }); // @TODO VFR: check all cases are correctly handled to prevent a js error in console

        k++;
      }
    }
  }

  return res;
};
