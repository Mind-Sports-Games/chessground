import * as util from './util';
import * as cg from './types';

type DropMobility = (x: number, y: number) => boolean;

const wholeBoard = (_x: number, _y: number) => true;
const noSquares = (_x: number, _y: number) => false;

/**
 *
 * @param from	1-based index from given playerIndex's PoV
 * @param to	1-based index from given playerIndex's PoV
 * @param playerIndex The piece's playerIndex
 * @param db  The board's dimensions
 *
 * Returns a function that checks if a position's rank is inside the from-to range, where from and to are indices of rank when counting from
 * current "playerIndex"'s point of view (i.e. if from=to=1 and playerIndex=p2 the function will return true only if the position's rank is 8 in case of 8x8 board)
 * from and to can be zero or negative to denote that many ranks counting from the last
 *
 * */
function rankRange(from: number, to: number, playerIndex: cg.PlayerIndex, bd: cg.BoardDimensions): DropMobility {
  const height = bd.height;
  if (from < 1) from += height;
  if (to < 1) to += height;
  return (_x, y) => {
    if (playerIndex === 'p2') y = height - y + 1;
    return from <= y && y <= to;
  };
}

function emptysquares(pieces: cg.Pieces): DropMobility {
  return (x, y) => {
    const pos = util.pos2key([x, y]) as cg.Key;
    return !pieces.has(pos);
  };
}

export default function predrop(
  pieces: cg.Pieces,
  piece: cg.Piece,
  bd: cg.BoardDimensions,
  variant: cg.Variant,
): cg.Key[] {
  const playerIndex = piece.playerIndex;
  const role = piece.role;

  // Pieces can be dropped anywhere on the board by default.
  // Mobility will be modified based on variant and piece to match the game rule.
  let mobility: DropMobility = wholeBoard;

  switch (variant) {
    case 'crazyhouse':
    case 'shouse':
    case 'capahouse':
    case 'gothhouse':
      switch (role) {
        case 'p-piece':
          mobility = rankRange(2, -1, playerIndex, bd);
          break; // pawns can't be dropped on the first rank or last rank
      }
      break;

    case 'placement':
      mobility = rankRange(1, 1, playerIndex, bd); // the "drop" is the placement phase where pieces can only be placed on the first rank
      break;

    case 'sittuyin':
      switch (role) {
        case 'r-piece':
          mobility = rankRange(1, 1, playerIndex, bd);
          break; // rooks can only be placed on the first rank
        default:
          mobility = (x, y) => {
            // the "drop" is the placement phase where pieces can be placed on its player's half of the board
            const width = bd.width;
            const height = bd.height;
            if (playerIndex === 'p2') {
              x = width - x + 1;
              y = height - y + 1;
            }
            return y < 3 || (y === 3 && x > 4);
          };
      }
      break;

    case 'shogi':
    case 'minishogi':
    case 'gorogoro':
      switch (role) {
        case 'p-piece': // pawns and lances can't be dropped on the last rank
        case 'l-piece':
          mobility = rankRange(1, -1, playerIndex, bd);
          break;
        case 'n-piece':
          mobility = rankRange(1, -2, playerIndex, bd);
          break; // knights can't be dropped on the last two ranks
      }
      break;

    // This code is unnecessary but is here anyway to be explicit
    case 'kyotoshogi':
    case 'dobutsu':
    case 'amazons':
      mobility = wholeBoard;
      break;

    case 'torishogi':
      switch (role) {
        case 's-piece':
          mobility = rankRange(1, -1, playerIndex, bd);
          break; // swallows can't be dropped on the last rank
      }
      break;

    case 'grandhouse':
      switch (role) {
        case 'p-piece':
          mobility = rankRange(2, 7, playerIndex, bd);
          break; // pawns can't be dropped on the 1st, or 8th to 10th ranks
      }
      break;

    case 'shogun':
      mobility = rankRange(1, 5, playerIndex, bd); // shogun only permits drops on ranks 1-5 for all pieces
      break;

    case 'synochess':
      mobility = (_x, y) => y === 5; // Only p2 can drop, and the only droppable rank is the literal rank five.
      break;

    case 'shinobi':
      mobility = (_x, y) => y <= 4; // Only p1 can drop, and only on their own half of the board
      break;

    case 'flipello10':
    case 'flipello':
      mobility = emptysquares(pieces); // cant drop on current pieces (either side) as they cant move
      break;

    case 'go9x9':
    case 'go13x13':
    case 'go19x19':
      mobility = emptysquares(pieces); // cant drop on current pieces (either side) as they cant move
      break;

    case 'nackgammon':
    case 'hyper':
    case 'backgammon':
      mobility = noSquares; // dont allow predrop for backgammon
      break;
    default:
      console.warn('Unknown drop variant', variant);
  }

  return util
    .allKeys(bd)
    .map(util.key2pos)
    .filter(pos => {
      return pieces.get(util.pos2key(pos))?.playerIndex !== playerIndex && mobility(pos[0], pos[1]);
    })
    .map(util.pos2key);
}
