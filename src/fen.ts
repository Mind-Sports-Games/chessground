import { pos2key, NRanks, invNRanks } from './util';
import * as cg from './types';

export const initial: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const commaFenVariants: cg.Variant[] = ['oware'];

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
            const letter = variant === 'oware' ? c : c.toLowerCase();
            const playerIndex = (
              variant === 'oware' && row === 1
                ? 'p1'
                : variant === 'oware' && row === 2
                ? 'p2'
                : c === letter
                ? 'p2'
                : 'p1'
            ) as cg.PlayerIndex;
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
          col += 1 + num;
          num = 0;
          const count = f.slice(0, -1);
          //const role = f.substring(f.length-1);
          const letter = (+count <= 26)
            ? String.fromCharCode(64 + +count)
            : String.fromCharCode(96-26 + +count);
          const playerIndex = ( 
            variant === 'oware' && row === 1
              ? 'p1'
              : variant === 'oware' && row === 2
              ? 'p2'
              : 'p1'
          ) as cg.PlayerIndex;
          const piece = {
            role: roles(letter),
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
  return invNRanks
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
              const charCode: number = letters(piece.role).charCodeAt(0);
              const count: number = (charCode <= 90) ? charCode - 64 : charCode - 70
              return count.toString() + (x === bd.width) ? '' : ',';
            }
          } else return '1';
        })
        .join('')
    )
    .join('/')
    .replace(/1{2,}/g, s => s.length.toString());
}
