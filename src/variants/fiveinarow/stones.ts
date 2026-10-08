import type * as cg from '../../types';
import { opposite } from '../../util';

// a stone keeps its colour for life; it belongs to whichever seat currently plays that colour
export const blackSeatFromFen = (fen: cg.FEN): cg.PlayerIndex => (fen.split(' ')[2] === '2' ? 'p2' : 'p1');

export const seatOf = (role: cg.Role, blackSeat: cg.PlayerIndex): cg.PlayerIndex =>
  role === 'b-piece' ? blackSeat : opposite(blackSeat);

export const blackSeatOnBoard = (pieces: cg.Pieces): cg.PlayerIndex | undefined => {
  for (const stone of pieces.values()) return seatOf(stone.role, stone.playerIndex);
  return undefined;
};

export const assignOwners = (pieces: cg.Pieces, blackSeat: cg.PlayerIndex): cg.Pieces => {
  for (const [key, stone] of pieces) pieces.set(key, { ...stone, playerIndex: seatOf(stone.role, blackSeat) });
  return pieces;
};
