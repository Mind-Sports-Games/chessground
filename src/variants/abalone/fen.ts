import { getCellList, pos2key } from './util';
import { roles } from '../../fen';
import { FEN, Pieces, PlayerIndex, Pos, Variant } from '../../types';

export const write = (variant: Variant, pieces: Pieces): FEN => {
  const cells = getCellList(variant);
  let fen = '';
  let empty = 0;
  let prevY: number | undefined = undefined;
  for (const pos of cells) {
    const [, y] = pos;
    if (prevY !== undefined && y !== prevY) {
      if (empty > 0) {
        fen += empty;
        empty = 0;
      }
      fen += '/';
    }
    prevY = y;
    const piece = pieces.get(pos2key(pos));
    if (piece) {
      if (empty > 0) {
        fen += empty;
        empty = 0;
      }
      const letter = piece.role.charAt(0);
      fen += piece.playerIndex === 'p1' ? letter.toUpperCase() : letter;
    } else {
      empty++;
    }
  }
  if (empty > 0) fen += empty;
  return fen;
};

export const read = (variant: Variant, fen: FEN): Pieces => {
  const res: Pieces = new Map();
  const cells: Pos[] = getCellList(variant);

  let k = 0;
  for (let i = 0; i < fen.length; i++) {
    const c = fen[i];
    if (c === ' ') break;
    else if (c !== '/') {
      const reg = fen.substring(i).match(/^[1-9][0-9]*/g);

      if (reg !== null && reg.length > 0) {
        k += parseInt(fen.substring(i, i + reg[0].length));
        i += reg[0].length - 1;
      } else {
        const letter = c.toLowerCase();
        const playerIndex = (c === c.toLowerCase() ? 'p2' : 'p1') as PlayerIndex;

        res.set(pos2key(cells[k++]), {
          role: roles(letter),
          playerIndex: playerIndex,
        }); // @TODO VFR: check all cases are correctly handled to prevent a js error in console
      }
    }
  }

  return res;
};
