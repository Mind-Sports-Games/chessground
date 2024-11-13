import { pos2key, NRanks, invNRanks } from './util';
import * as cg from './types';

import { read as abaloneRead } from './variants/abalone/fen';

export const initial: cg.FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';
const commaFenVariants: cg.Variant[] = ['oware', 'togyzkumalak', 'bestemshe', 'backgammon', 'hyper', 'nackgammon'];
const mancalaFenVariants: cg.Variant[] = ['oware', 'togyzkumalak', 'bestemshe'];

export function roles(letter: string) {
  return (letter.replace('+', 'p') + '-piece') as cg.Role;
}

function letters(role: cg.Role) {
  const letterPart = role.slice(0, role.indexOf('-'));
  return letterPart.length > 1 ? letterPart.replace('p', '+') : letterPart;
}

export function read(fen: cg.FEN, dimensions: cg.BoardDimensions, variant: cg.Variant): cg.Pieces {
  if(variant === "abalone") return abaloneRead(fen, dimensions);
  if (fen === 'start') fen = initial;
  if (fen.indexOf('[') !== -1) fen = fen.slice(0, fen.indexOf('['));
  const pieces: cg.Pieces = new Map();
  let row: number = dimensions.height;
  let col = 0;
  let promoted = false;
  let num = 0;

  // @TODO: try to refactor using Higher Order Functions with a default square board
  if (!commaFenVariants.includes(variant)) {
    let skipNext = false;
    for (let i = 0; i < fen.length; i++) {
      if (skipNext) {
        skipNext = false;
        continue;
      }
      const c = fen[i];
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
          // need to deal with double digits, due to large boards, look ahead here
          const step = parseInt(c, 10);
          if (step > 0) {
            let stepped = false;
            if (dimensions.width > 9 && i < fen.length + 1 && parseInt(fen[i + 1]) >= 0) {
              const twoCharStep = parseInt(c + fen[i + 1]);
              if (twoCharStep > 0) {
                col += twoCharStep;
                stepped = true;
                skipNext = true;
              }
            }
            if (!stepped) {
              num += step;
            }
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
          col += 1 + num;
          num = 0;
          const count = f.slice(0, -1);
          const role = f.substring(f.length - 1).toLowerCase();
          const playerIndex = (
            mancalaFenVariants.includes(variant)
              ? row === 1
                ? 'p1'
                : 'p2'
              : f.substring(f.length - 1) === role
                ? 'p2'
                : 'p1'
          ) as cg.PlayerIndex;
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

export function readPocket(fen: cg.FEN, variant: cg.Variant): cg.Piece[] {
  if (
    (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon') &&
    fen.indexOf('[') !== -1 &&
    fen.indexOf(']') !== -1
  ) {
    const start = fen.indexOf('[', 0);
    const end = fen.indexOf(']', start);
    const pocket = fen.substring(start + 1, end);
    if (pocket === '') return [];
    const pocketPieces: cg.Piece[] = [];
    for (const p of pocket.split(',')) {
      const count = p.slice(0, -1);
      const role = p.substring(p.length - 1).toLowerCase();
      const playerIndex = p.substring(p.length - 1) === role ? 'p2' : 'p1';
      const piece = {
        role: `${role}${count}-piece`,
        playerIndex: playerIndex,
      } as cg.Piece;
      pocketPieces.push(piece);
    }
    return pocketPieces;
  } else return [];
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
              const letter = piece.role.charAt(0);
              const roleLetter = mancalaFenVariants.includes(variant)
                ? letter.toUpperCase()
                : piece.playerIndex === 'p1'
                  ? letter.toUpperCase()
                  : letter;
              const count = piece.role.split('-')[0].substring(1);
              return count + roleLetter + (x === bd.width ? '' : ',');
            }
          } else return '1' + (!commaFenVariants.includes(variant) ? '' : ',');
        })
        .join(''),
    )
    .join('/');
  return !commaFenVariants.includes(variant)
    ? fen.replace(/1{2,}/g, s => s.length.toString())
    : fen
        .replace(/(1,){2,}/g, s => (s.length / 2).toString() + ',')
        .replace(',/', '/')
        .replace(', ', ' ');
}
