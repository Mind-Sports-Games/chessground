import { pos2key, NRanks, invNRanks } from './util';
import * as cg from './types';

export const initial: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const commaFenVariants: cg.Variant[] = ['oware', 'togyzkumalak'];

function roles(letter: string) {
  return (letter.replace('+', 'p') + '-piece') as cg.Role;
}

function letters(role: cg.Role) {
  const letterPart = role.slice(0, role.indexOf('-'));
  return letterPart.length > 1 ? letterPart.replace('p', '+') : letterPart;
}

export function read(fen: cg.FEN, dimensions: cg.BoardDimensions, variant: cg.Variant): cg.Pieces {
  if (fen === 'start') fen = initial;
  if (fen.indexOf('[') !== -1) fen = fen.slice(0, fen.indexOf('['));
  const pieces: cg.Pieces = new Map();
  let row: number = dimensions.height;
  let col = 0;
  let promoted = false;
  let num = 0;

  if (!commaFenVariants.includes(variant)) {
    for (const c of fen) {
      switch (c) {
        case ' ':
          return pieces;
        case '/':
          --row;
          if (row === 0) return pieces;
          col = 0;
          num = 0;
          break;
        case '+':
          promoted = true;
          break;
        case '~': {
          const piece = pieces.get(pos2key([col, row]));
          if (piece) piece.promoted = true;
          break;
        }
        default: {
          const nb = c.charCodeAt(0);
          if (48 <= nb && nb < 58) {
            num = num + nb - 48; // allow set of numbers (e.g. 1's) for space gaps
          } else {
            col += 1 + num;
            num = 0;
            const letter = c.toLowerCase();
            const playerIndex = (c === letter ? 'p2' : 'p1') as cg.PlayerIndex;
            const piece = {
              role: roles(letter),
              playerIndex: playerIndex,
            } as cg.Piece;
            if (promoted) {
              piece.role = ('p' + piece.role) as cg.Role;
              piece.promoted = true;
              promoted = false;
            }
            pieces.set(pos2key([col, row]), piece);
          }
        }
      }
    }
  } else {
    for (const r of fen.split(' ')[0].split('/')) {
      for (const f of r.split(',')) {
        if (isNaN(+f)) {
          //some mancala specific code in here
          col += 1 + num;
          num = 0;
          const count = f.slice(0, -1);
          const role = f.substring(f.length-1).toLowerCase();
          const playerIndex = (row === 1 ? 'p1' : 'p2') as cg.PlayerIndex;
          const piece = {
            role: `${role}${count}-piece`,
            playerIndex: playerIndex,
          } as cg.Piece;
          pieces.set(pos2key([col, row]), piece);
        } else {
          num = num + +f;
        }
      }
      --row;
      if (row === 0) return pieces;
      col = 0;
      num = 0;
    }
  }
  return pieces;
}

export function write(pieces: cg.Pieces, bd: cg.BoardDimensions, variant: cg.Variant): cg.FEN {
  const fen = invNRanks
    .slice(-bd.height)
    .map(y =>
      NRanks.slice(0, bd.width)
        .map(x => {
          const piece = pieces.get(pos2key([x, y]));
          if (piece) {
            if (!commaFenVariants.includes(variant)) {
              const letter: string =
                letters(piece.role) + (piece.promoted && letters(piece.role).charAt(0) !== '+' ? '~' : '');
              return piece.playerIndex === 'p1' ? letter.toUpperCase() : letter;
            } else {
              //mancala specific code here
              const roleLetter = piece.role.charAt(0);
              const count = piece.role.split('-')[0].substring(1);
              return count + roleLetter.toUpperCase() + (x === bd.width ? '' : ',');
            }
          } else return '1' + (!commaFenVariants.includes(variant) ? '' : ',');
        })
        .join('')
    )
    .join('/');
  return (!commaFenVariants.includes(variant))
    ? fen.replace(/1{2,}/g, s => s.length.toString())
    : fen.replace(/(1,){2,}/g, s => (s.length/2).toString() + ',').replace(',/', '/').replace(', ', ' ');
}
