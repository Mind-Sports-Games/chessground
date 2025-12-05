import type * as cg from '../../types';

export const read = (fen: cg.FEN): cg.Pieces => {
  const pieces: cg.Pieces = new Map();

  for (const pieceList of fen.split(':').slice(1, 3)) {
    if (pieceList.length === 1) {
      continue;
    }
    const playerIndex = (pieceList[0] === 'W' ? 'p1' : 'p2') as cg.PlayerIndex;
    for (const pieceStr of pieceList.slice(1).split(',')) {
      let key: cg.Key;
      /* Possible roles: m = man, k = king,
      g = ghostman, p = ghostking, a = activeman, b = activeking */
      let role: cg.Role;
      if (pieceStr.length === 2) {
        role = 'm-piece';
        key = pieceStr as cg.Key;
      } else {
        role = `${pieceStr[0].toLowerCase()}-piece` as cg.Role;
        key = pieceStr.slice(1) as cg.Key;
      }
      const piece = {
        role: role,
        playerIndex: playerIndex,
      } as cg.Piece;
      pieces.set(key, piece);
    }
  }

  return pieces;
};
