import type * as cg from '../../types';
import { key2pos, opposite, pos2key } from '../../util';

// a renju fifth stone offered by black, waiting beside the board for white to pick it
export const offeredRole: cg.Role = 'o-piece';

const isBlack = (role: cg.Role): boolean => role === 'b-piece' || role === offeredRole;

// a stone keeps its colour for life; it belongs to whichever seat currently plays that colour
export const blackSeatFromFen = (fen: cg.FEN): cg.PlayerIndex => (fen.split(' ')[2] === '2' ? 'p2' : 'p1');

export const seatOf = (role: cg.Role, blackSeat: cg.PlayerIndex): cg.PlayerIndex =>
  isBlack(role) ? blackSeat : opposite(blackSeat);

export const blackSeatOnBoard = (pieces: cg.Pieces): cg.PlayerIndex | undefined => {
  for (const stone of pieces.values()) return seatOf(stone.role, stone.playerIndex);
  return undefined;
};

// the fen writes stones in upper case and an offered stone as a lower case b
export const assignOwners = (pieces: cg.Pieces, blackSeat: cg.PlayerIndex): cg.Pieces => {
  for (const [key, stone] of pieces) {
    const role = stone.role === 'b-piece' && stone.playerIndex === 'p2' ? offeredRole : stone.role;
    pieces.set(key, { role, playerIndex: seatOf(role, blackSeat) });
  }
  return pieces;
};

export const isOffered = (piece: cg.Piece | undefined): boolean => piece?.role === offeredRole;

// renju: once white picks the fifth stone, the stones black offered but white passed over leave the board
export const removeOffered = (pieces: cg.Pieces): void => {
  for (const [key, stone] of pieces) if (isOffered(stone)) pieces.delete(key);
};

const directions: cg.NumberPair[] = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
];

// pente: a stone closing off exactly two of the other colour's stones in a line takes them
export const penteCaptures = (pieces: cg.Pieces, key: cg.Key, dropped: cg.Piece, bd: cg.BoardDimensions): cg.Key[] => {
  const [x, y] = key2pos(key);
  const colourAt = (step: number, [dx, dy]: cg.NumberPair): boolean | undefined => {
    const [px, py] = [x + dx * step, y + dy * step];
    if (px < 1 || py < 1 || px > bd.width || py > bd.height) return undefined;
    const stone = pieces.get(pos2key([px, py]));
    return stone && !isOffered(stone) ? isBlack(stone.role) : undefined;
  };
  const black = isBlack(dropped.role);
  return directions
    .filter(dir => colourAt(1, dir) === !black && colourAt(2, dir) === !black && colourAt(3, dir) === black)
    .flatMap(([dx, dy]) => [pos2key([x + dx, y + dy]), pos2key([x + 2 * dx, y + 2 * dy])]);
};
