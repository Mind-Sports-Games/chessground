import * as cg from './types';
import * as T from './transformations';

export const playerIndexs: cg.PlayerIndex[] = ['p1', 'p2'];
export const invRanks: readonly cg.Rank[] = [...cg.ranks19].reverse();
export const NRanks: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19];
export const invNRanks: number[] = [19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1];

function files(n: number) {
  return cg.files.slice(0, n);
}

function ranks(n: number) {
  return cg.ranks19.slice(0, n);
}

export function allKeys(bd: cg.BoardDimensions = { width: 8, height: 8 }) {
  return Array.prototype.concat(...files(bd.width).map(c => ranks(bd.height).map(r => c + r)));
}

export function pos2key(pos: cg.Pos): cg.Key {
  return (cg.files[pos[0] - 1] + cg.ranks19[pos[1] - 1]) as cg.Key;
}

export function key2pos(k: cg.Key): cg.Pos {
  return [k.charCodeAt(0) - 96, parseInt(k.slice(1))] as cg.Pos;
}

export const allPos = (bd: cg.BoardDimensions): cg.Pos[] => allKeys(bd).map(key2pos);

export function adjacentKeys(bd: cg.BoardDimensions, key: cg.Key): cg.Key[] {
  const pos = key2pos(key);
  const adjacentSquares = [
    [0, 1],
    [0, -1],
    [1, 0],
    [-1, 0],
  ];
  return adjacentSquares
    .map(offset => [pos[0] + offset[0], pos[1] + offset[1]])
    .filter(p => p[0] > 0 && p[0] <= bd.width && p[1] > 0 && p[1] <= bd.height)
    .map(p => pos2key(p as cg.Pos));
}

export const surroundedDirections: number[][] = [
  [1, 1],
  [1, 0],
  [1, -1],
  [0, 1],
  [0, -1],
  [-1, 1],
  [-1, 0],
  [-1, -1],
];

export function memo<A>(f: () => A): cg.Memo<A> {
  let v: A | undefined;
  const ret = (): A => {
    if (v === undefined) v = f();
    return v;
  };
  ret.clear = () => {
    v = undefined;
  };
  return ret;
}

export const timer = (): cg.Timer => {
  let startAt: number | undefined;
  return {
    start() {
      startAt = performance.now();
    },
    cancel() {
      startAt = undefined;
    },
    stop() {
      if (!startAt) return 0;
      const time = performance.now() - startAt;
      startAt = undefined;
      return time;
    },
  };
};

export const opposite = (c: cg.PlayerIndex): cg.PlayerIndex => (c === 'p1' ? 'p2' : 'p1');

const flipOrientationLookup: Record<cg.Orientation, cg.Orientation> = {
  p1: 'p2',
  p2: 'p1',
  left: 'right',
  right: 'left',
  p1vflip: 'p1',
};
const flipOrientationLookupBG: Record<cg.Orientation, cg.Orientation> = {
  p1: 'p1vflip',
  p1vflip: 'p1',
  //these are unsued for backgammon but mandatory
  p2: 'p2',
  left: 'left',
  right: 'right',
};
export const oppositeOrientation = (c: cg.Orientation): cg.Orientation => flipOrientationLookup[c];
export const oppositeOrientationBG = (c: cg.Orientation): cg.Orientation => flipOrientationLookupBG[c];
const flipOrientationLookupForLOA: Record<cg.PlayerIndex, cg.Orientation> = {
  p1: 'right',
  p2: 'p1',
};
export const oppositeOrientationForLOA = (c: cg.PlayerIndex): cg.Orientation => flipOrientationLookupForLOA[c];
const orientationLookupForLOA: Record<cg.PlayerIndex, cg.Orientation> = {
  p1: 'p1',
  p2: 'right',
};
export const orientationForLOA = (c: cg.PlayerIndex): cg.Orientation => orientationLookupForLOA[c];
const flipOrientationLookupForBackgammon: Record<cg.PlayerIndex, cg.Orientation> = {
  p1: 'p1vflip',
  p2: 'p1',
};
export const oppositeOrientationForBackgammon = (c: cg.PlayerIndex): cg.Orientation =>
  flipOrientationLookupForBackgammon[c];
const orientationLookupForBackgammon: Record<cg.PlayerIndex, cg.Orientation> = {
  p1: 'p1',
  p2: 'p1vflip',
};
export const orientationForBackgammon = (c: cg.PlayerIndex): cg.Orientation => orientationLookupForBackgammon[c];

export const isPlayerIndex = (c: cg.Orientation): c is cg.PlayerIndex => c === 'p1' || c === 'p2';

export function containsX<X>(xs: X[] | undefined, x: X): boolean {
  return xs !== undefined && xs.indexOf(x) !== -1;
}

export const distanceSq = (pos1: cg.Pos, pos2: cg.Pos): number => {
  const dx = pos1[0] - pos2[0],
    dy = pos1[1] - pos2[1];
  return dx * dx + dy * dy;
};

export const samePiece = (player1: cg.Piece, player2: cg.Piece): boolean => {
  return player1.role === player2.role && player1.playerIndex === player2.playerIndex;
};

const posToTranslateBase = (
  pos: cg.Pos,
  orientation: cg.Orientation,
  xFactor: number,
  yFactor: number,
  bt: cg.BoardDimensions,
): cg.NumberPair => {
  return T.translateBase[orientation](pos, xFactor, yFactor, bt);
};

export const posToTranslateAbs = (
  bounds: ClientRect,
  bt: cg.BoardDimensions,
  variant: cg.Variant,
): ((pos: cg.Pos, orientation: cg.Orientation) => cg.NumberPair) => {
  const xFactor =
      (bounds.width / bt.width) *
      (variant === 'backgammon' || variant === 'hyper' || variant === 'nackgammon' ? 0.8 : 1),
    yFactor = bounds.height / bt.height;

  return (pos, orientation) => posToTranslateBase(pos, orientation, xFactor, yFactor, bt);
};

export const posToTranslateRel = (
  pos: cg.Pos,
  orientation: cg.Orientation,
  bt: cg.BoardDimensions,
  v: cg.Variant,
): cg.NumberPair => {
  return posToTranslateBase(
    pos,
    orientation,
    100,
    v === 'togyzkumalak' || v === 'bestemshe'
      ? 150
      : v === 'backgammon' || v === 'hyper' || v === 'nackgammon'
        ? 116
        : 100,
    bt,
  );
};

export const translateAbs = (el: HTMLElement, pos: cg.NumberPair): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px)`;
};

export const translateAbsAndRotate = (el: HTMLElement, pos: cg.NumberPair, deg: number): void => {
  el.style.transform = `translate(${pos[0]}px,${pos[1]}px) rotate(${deg}deg)`;
};

export const translateRel = (el: HTMLElement, percents: cg.NumberPair): void => {
  el.style.transform = `translate(${percents[0]}%,${percents[1]}%)`;
};

export const translateRelAndRotate = (el: HTMLElement, percents: cg.NumberPair, deg: number): void => {
  el.style.transform = `translate(${percents[0]}%,${percents[1]}%) rotate(${deg}deg)`;
};

export const setVisible = (el: HTMLElement, v: boolean): void => {
  el.style.visibility = v ? 'visible' : 'hidden';
};

export const eventPosition = (e: cg.MouchEvent): cg.NumberPair | undefined => {
  if (e.clientX || e.clientX === 0) return [e.clientX, e.clientY!];
  if (e.targetTouches?.[0]) return [e.targetTouches[0].clientX, e.targetTouches[0].clientY];
  return; // touchend has no position!
};

export const isRightButton = (e: cg.MouchEvent): boolean => e.buttons === 2 || e.button === 2;

export const createEl = (tagName: string, className?: string): HTMLElement => {
  const el = document.createElement(tagName);
  if (className) el.className = className;
  return el;
};

export function computeSquareCenter(
  key: cg.Key,
  orientation: cg.Orientation,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): cg.NumberPair {
  const pos = T.mapToP1Inverse[orientation](key2pos(key), bd);
  return [
    bounds.left + (bounds.width * (pos[0] - 1 + 0.5)) / bd.width,
    bounds.top + (bounds.height * (bd.height - (pos[1] - 1 + 0.5))) / bd.height,
  ];
}

export function calculatePlayerEmptyAreas(
  pieces: cg.Pieces,
  bd: cg.BoardDimensions,
  deadStones: cg.Pieces,
): Map<cg.Key, cg.PlayerIndex> {
  const emptySquares: cg.Key[] = allKeys(bd).filter(key => !pieces.has(key) || deadStones.has(key));
  const piecesToConsider = new Map<cg.Key, cg.Piece>();
  pieces.forEach((piece: cg.Piece, key: cg.Key) => {
    piecesToConsider.set(key, piece);
  });
  deadStones.forEach((_: cg.Piece, key: cg.Key) => {
    piecesToConsider.delete(key);
  });
  const areas: cg.Key[][] = calculateAreas(emptySquares, bd);

  const playerAreas = new Map<cg.Key, cg.PlayerIndex>();

  for (const area of areas) {
    const borderKeys = calculateBorder(area, bd);
    const surroundingPlayers = new Set(borderKeys.map(k => piecesToConsider.get(k)?.playerIndex));
    if (surroundingPlayers.size === 1) {
      for (const k of area) {
        if (!Array.from(deadStones.keys()).includes(k)) {
          playerAreas.set(k, surroundingPlayers.has('p1') ? 'p1' : 'p2');
        }
      }
    }
  }

  return playerAreas;
}

export function calculateBorder(squares: cg.Key[], bd: cg.BoardDimensions): cg.Key[] {
  return squares.flatMap(k => adjacentKeys(bd, k)).filter(k => !squares.includes(k));
}

export function calculateAreas(emptySquares: cg.Key[], bd: cg.BoardDimensions): cg.Key[][] {
  function assignNextWave(squaresToBeAssigned: cg.Key[], emptyAreas: cg.Key[][]): cg.Key[][] {
    const emptySquaresToAdd = squaresToBeAssigned.filter(stba =>
      emptyAreas
        .slice(0, 1)
        .flat()
        .flatMap(s => adjacentKeys(bd, s))
        .includes(stba),
    );
    const updatedEmptyAreas =
      emptySquaresToAdd.length === 0
        ? [squaresToBeAssigned.slice(0, 1)].concat(emptyAreas)
        : [emptyAreas.slice(0, 1).flat().concat(emptySquaresToAdd)].concat(emptyAreas.slice(1));

    const updatedSquaresToBeAssigned = squaresToBeAssigned.filter(s => !updatedEmptyAreas.flat().includes(s));

    if (updatedSquaresToBeAssigned.length > 0) {
      return assignNextWave(updatedSquaresToBeAssigned, updatedEmptyAreas);
    } else {
      return updatedEmptyAreas;
    }
  }

  return assignNextWave(emptySquares.slice(1), [emptySquares.slice(0, 1)]);
}

export function calculatePieceGroup(pieceKey: cg.Key, pieces: cg.Pieces, bd: cg.BoardDimensions): cg.Key[] {
  function assignNextWave(pieceGroup: cg.Key[]): cg.Key[] {
    const borderKeys = calculateBorder(pieceGroup, bd);
    const newKeys = borderKeys.filter(
      k => pieces.get(k) && pieces.get(k)?.playerIndex === pieces.get(pieceKey)?.playerIndex,
    );
    if (newKeys.length > 0) {
      return assignNextWave(pieceGroup.concat(newKeys));
    } else {
      return pieceGroup;
    }
  }

  return assignNextWave([pieceKey]);
}

export function calculateGoCaptures(pieceKey: cg.Key, pieces: cg.Pieces, bd: cg.BoardDimensions): cg.Key[] {
  const borderKeys = calculateBorder([pieceKey], bd);
  const enemyKeys = borderKeys.filter(
    k => pieces.get(k) && pieces.get(k)?.playerIndex !== pieces.get(pieceKey)?.playerIndex,
  );
  const enemyPieces = enemyKeys.map(k => calculatePieceGroup(k, pieces, bd));
  const capturedPieces = enemyPieces.filter(
    enemyGroup => calculateBorder(enemyGroup, bd).filter(k => !pieces.has(k)).length === 0,
  );
  return [...new Set(capturedPieces.flat())];
}

export function calculateGoScores(deadStones: cg.Pieces, pieces: cg.Pieces, bd: cg.BoardDimensions): cg.SimpleGoScores {
  let p1Score = 0;
  let p2Score = 0;

  const remainingPieces = new Map<cg.Key, cg.Piece>([...Array.from(pieces.entries())]);
  for (const [k, _] of deadStones) {
    remainingPieces.delete(k);
  }
  const areas = calculatePlayerEmptyAreas(remainingPieces, bd, new Map<cg.Key, cg.Piece>());
  for (const [_, p] of areas) {
    if (p === 'p1') p1Score++;
    else p2Score++;
  }

  const remainingPieceKeys: cg.Key[] = allKeys(bd).filter(key => pieces.has(key) && !deadStones.has(key));
  p1Score = p1Score + remainingPieceKeys.filter(k => pieces.get(k)?.playerIndex === 'p1').length;
  p2Score = p2Score + remainingPieceKeys.filter(k => pieces.get(k)?.playerIndex === 'p2').length;

  return {
    p1: p1Score,
    p2: p2Score,
  };
}

export function calculateBackgammonScores(
  pieces: cg.Pieces,
  pocketPieces: cg.Piece[],
  bd: cg.BoardDimensions,
): cg.BackgammonScores {
  let p1Score = 0;
  let p2Score = 0;
  //pieces on board
  for (const [k, p] of pieces) {
    const pos = key2pos(k);
    const boardPosNumber = pos[1] === 1 ? pos[0] + bd.width : bd.width + 1 - pos[0];
    const count = p.role.split('-')[0].slice(1);
    if (p.playerIndex === 'p1') {
      const distanceOff = bd.height * bd.width + 1 - boardPosNumber;
      p1Score += parseInt(count, 10) * distanceOff;
    } else {
      const distanceOff = boardPosNumber;
      p2Score += parseInt(count, 10) * distanceOff;
    }
  }
  //captured pieces
  for (const pp of pocketPieces) {
    const count = pp.role.split('-')[0].slice(1);
    if (pp.playerIndex === 'p1') {
      p1Score += parseInt(count, 10) * (bd.height * bd.width + 1);
    } else {
      p2Score += parseInt(count, 10) * (bd.height * bd.width + 1);
    }
  }
  return {
    p1: p1Score,
    p2: p2Score,
  };
}

export function backgammonPosDiff(orig: cg.Key, dest: cg.Key): number {
  const origFile = key2pos(orig)[0];
  const origRank = key2pos(orig)[1];
  const destFile = key2pos(dest)[0];
  const destRank = key2pos(dest)[1];
  if (origRank === destRank) {
    return Math.abs(origFile - destFile);
  } else {
    return origFile + destFile - 1;
  }
}

export function calculateFlippingPieces(
  bd: cg.BoardDimensions,
  pieces: cg.Pieces,
  piece: cg.Piece,
  key: cg.Key,
): cg.Key[] {
  const flipping: cg.Key[] = [];
  const orig: cg.Pos = key2pos(key);
  let flip_list: cg.Key[] = [];

  for (const direction of surroundedDirections) {
    flip_list = [];
    for (let step = 1; step < bd.width; step++) {
      const pos: [number, number] = [orig[0] + step * direction[0], orig[1] + step * direction[1]];
      if (pos[0] < 1 || pos[0] > bd.width || pos[1] < 1 || pos[1] > bd.height) {
        break;
      }
      const k = pos2key(pos);
      const p = pieces.get(k);
      if (p && p.playerIndex === piece.playerIndex) {
        flip_list.forEach(x => flipping.push(x));
        break;
      } else if (p && p.playerIndex !== piece.playerIndex) {
        flip_list.push(pos2key(pos));
      } else {
        break;
      }
    }
  }

  return flipping;
}

export function owareUpdatePiecesFromMove(
  bd: cg.BoardDimensions,
  pieces: cg.Pieces,
  orig: cg.Key,
  dest: cg.Key,
): cg.PiecesDiff {
  const boardWidth = bd.width;
  const boardArray = createMancalaBoardArrayFromPieces(pieces, bd);
  const origBoardIndex = boardIndexFromUci(orig, boardWidth);
  const destBoardIndex = boardIndexFromUci(dest, boardWidth);
  const stones = boardArray[origBoardIndex];
  const extraStoneArray = Array<number>(boardWidth * 2).fill(0);

  //calculate where the stones from moving piece will land
  for (let i = 1; i < stones + 1; i++) {
    const missingOwnHouse = Math.floor((i - 1) / (boardWidth * 2 - 1));
    const indexToAdd = (origBoardIndex + i + missingOwnHouse) % (boardWidth * 2);
    extraStoneArray[indexToAdd] += 1;
  }

  //remove piece that is moving
  const boardArrayRemovedMovingPiece = boardArray.slice(0, boardArray.length);
  boardArrayRemovedMovingPiece[origBoardIndex] = 0;

  //add moving stones to board
  const finalBoardArray = boardArrayRemovedMovingPiece.map((v, i) => v + extraStoneArray[i]);

  //remove any captured pieces (must check for grandslam!)
  if (dest[1] !== orig[1] && !isGrandSlam(finalBoardArray, destBoardIndex, boardWidth)) {
    for (let i = 0; i < (destBoardIndex % boardWidth) + 1; i++) {
      const captureIndex = destBoardIndex - i;
      if (finalBoardArray[captureIndex] === 2 || finalBoardArray[captureIndex] === 3) {
        finalBoardArray[captureIndex] = 0;
      } else {
        break;
      }
    }
  }

  //calculate the new pieces of the board to update chessground with
  const updatedPieces: cg.PiecesDiff = new Map();
  const defaultPieceLetter = 's';
  for (let i = 0; i < finalBoardArray.length; i++) {
    const playerIndex: 'p1' | 'p2' = i < boardWidth ? 'p1' : 'p2';
    const numStones = finalBoardArray[i];
    const pos: cg.Pos = [i < boardWidth ? i + 1 : boardWidth * 2 - i, i < boardWidth ? 1 : 2] as cg.Pos;
    const k: cg.Key = pos2key(pos);
    if (numStones === 0) {
      updatedPieces.set(k, undefined);
    } else {
      const piece: cg.Piece = {
        role: `${defaultPieceLetter}${finalBoardArray[i]}-piece` as cg.Role,
        playerIndex: playerIndex,
      };
      updatedPieces.set(k, piece);
    }
  }

  return updatedPieces;
}

export function togyzkumalakUpdatePiecesFromMove(
  bd: cg.BoardDimensions,
  pieces: cg.Pieces,
  orig: cg.Key,
  dest: cg.Key,
  usesTuzdik: boolean,
): cg.PiecesDiff {
  const boardWidth = bd.width;
  const boardArray = createMancalaBoardArrayFromPieces(pieces, bd);
  const origBoardIndex = boardIndexFromUci(orig, boardWidth);
  const destBoardIndex = boardIndexFromUci(dest, boardWidth);
  const stones = boardArray[origBoardIndex];
  const extraStoneArray = Array<number>(boardWidth * 2).fill(0);

  //calculate where the stones from moving piece will land
  if (stones === 1) {
    extraStoneArray[(origBoardIndex + 1) % (boardWidth * 2)] = 1;
  } else {
    for (let i = 0; i < stones; i++) {
      const indexToAdd = (origBoardIndex + i) % (boardWidth * 2);
      extraStoneArray[indexToAdd] += 1;
    }
  }
  //remove piece that is moving (it will always get replaced by a new piece if not count 1)
  const boardArrayRemovedMovingPiece = boardArray.slice(0, boardArray.length);
  boardArrayRemovedMovingPiece[origBoardIndex] = 0;

  //add moving stones to board
  const finalBoardArray = boardArrayRemovedMovingPiece.map((v, i) => v + extraStoneArray[i]);

  //remove any normal (even) captured pieces from dest
  if (dest[1] !== orig[1] && finalBoardArray[destBoardIndex] % 2 === 0) {
    finalBoardArray[destBoardIndex] = 0;
  }

  // get current board array index of tuzdik
  const existingTuzdik = [...pieces.entries()]
    .filter(it => it[1].role === 't-piece')
    .map(([k, _], __) => boardIndexFromUci(k, bd.width));

  //is tuzdik created
  const createdTuzdik =
    usesTuzdik &&
    existingTuzdik.length !== 2 &&
    finalBoardArray[destBoardIndex] === 3 &&
    dest[1] !== orig[1] &&
    destBoardIndex !== boardWidth - 1 &&
    destBoardIndex !== boardWidth * 2 - 1 &&
    (existingTuzdik.length === 0 ||
      (existingTuzdik.length === 1 &&
        existingTuzdik[0] % boardWidth !== destBoardIndex % boardWidth &&
        Math.floor(existingTuzdik[0] / boardWidth) !== Math.floor(destBoardIndex / boardWidth)));

  //remove potential stones where there is a tuzdik
  if (createdTuzdik) finalBoardArray[destBoardIndex] = 0;
  existingTuzdik.map(i => (finalBoardArray[i] = 0));

  //calculate the new pieces of the board to update chessground with
  const updatedPieces: cg.PiecesDiff = new Map();
  const defaultPieceLetter = 's';
  for (let i = 0; i < finalBoardArray.length; i++) {
    const playerIndex: 'p1' | 'p2' = i < boardWidth ? 'p1' : 'p2';
    const numStones = finalBoardArray[i];
    const pos: cg.Pos = [i < boardWidth ? i + 1 : boardWidth * 2 - i, i < boardWidth ? 1 : 2] as cg.Pos;
    const k: cg.Key = pos2key(pos);
    if (numStones === 0) {
      if ((createdTuzdik && destBoardIndex === i) || existingTuzdik.includes(i)) {
        const piece: cg.Piece = {
          role: `t-piece` as cg.Role,
          playerIndex: playerIndex, //who owns this?
        };
        updatedPieces.set(k, piece);
      } else {
        updatedPieces.set(k, undefined);
      }
    } else {
      const piece: cg.Piece = {
        role: `${defaultPieceLetter}${finalBoardArray[i]}-piece` as cg.Role,
        playerIndex: playerIndex,
      };
      updatedPieces.set(k, piece);
    }
  }
  return updatedPieces;
}

function createMancalaBoardArrayFromPieces(pieces: cg.Pieces, bd: cg.BoardDimensions): number[] {
  function countAtKey(key: cg.Key): number {
    const piece = pieces.get(key);
    if (piece) {
      return Number(piece.role.split('-')[0].substring(1));
    } else return 0;
  }
  // we want to traverse anti-clockwise around the board from a1 to a2
  function boardSort(a: cg.Key, b: cg.Key): number {
    return (
      (Number(a.substring(1)) * -2 + 3) * a.charCodeAt(0) +
      Number(a.substring(1)) * 100 -
      (Number(a.substring(1)) * -2 + 3) * b.charCodeAt(0) -
      Number(b.substring(1)) * 100
    );
  }
  return allKeys(bd)
    .sort((a, b) => boardSort(a, b))
    .map(countAtKey);
}

function boardIndexFromUci(uci: cg.Key, boardWidth: number): number {
  return uci[1] === '1' ? uci[0].charCodeAt(0) - 97 : 96 - uci.charCodeAt(0) + 2 * boardWidth;
}

//assumption - move has been played but oware stones not captured, dest is on opponents side
function isGrandSlam(finalBoardArray: number[], destBoardIndex: number, boardWidth: number): boolean {
  //check spaces not possible to capture are 0
  for (let i = 1; i < boardWidth - (destBoardIndex % boardWidth); i++) {
    if (finalBoardArray[destBoardIndex + i] !== 0) return false;
  }
  //check captures to edge and then non-zeros
  let checkCapture = true;
  for (let i = 0; i < (destBoardIndex % boardWidth) + 1; i++) {
    const captureIndex = destBoardIndex - i;
    if (checkCapture && (finalBoardArray[captureIndex] === 2 || finalBoardArray[captureIndex] === 3)) {
      continue;
    } else {
      checkCapture = false;
      if (finalBoardArray[captureIndex] !== 0) {
        return false;
      }
    }
  }

  return true;
}

export function calculateBackgammonDropChanges(pieces: cg.Pieces, piece: cg.Piece, key: cg.Key): cg.PiecesDiff {
  const diff: cg.PiecesDiff = new Map();
  const roleLetter = 's';

  const destPiece = pieces.get(key);
  if (destPiece) {
    const dCount = +destPiece.role.split('-')[0].substring(1);
    const dPlayerIndex = destPiece.playerIndex;
    if (dPlayerIndex === piece.playerIndex) {
      const newPiece = {
        role: `${roleLetter}${dCount + 1}-piece`,
        playerIndex: piece.playerIndex,
      } as cg.Piece;
      diff.set(key, newPiece);
    } else {
      const newPiece = {
        role: `${roleLetter}1-piece`,
        playerIndex: piece.playerIndex,
      } as cg.Piece;
      diff.set(key, newPiece);
    }
  } else {
    //empty space
    const newPiece = {
      role: `${roleLetter}1-piece`,
      playerIndex: piece.playerIndex,
    } as cg.Piece;
    diff.set(key, newPiece);
  }
  return diff;
}

export function backgammonUpdatePiecesFromMove(pieces: cg.Pieces, orig: cg.Key, dest: cg.Key): cg.PiecesDiff {
  const origPiece = pieces.get(orig),
    destPiece = pieces.get(dest);

  const diff: cg.PiecesDiff = new Map();
  //Update orig and dest squares as they may have changed
  if (origPiece) {
    const oCount = +origPiece.role.split('-')[0].substring(1);
    const oRoleLetter = origPiece.role.charAt(0);
    const oPlayerIndex = origPiece.playerIndex;
    if (oCount > 1) {
      const piece = {
        role: `${oRoleLetter}${oCount - 1}-piece`,
        playerIndex: oPlayerIndex,
      } as cg.Piece;
      diff.set(orig, piece);
    } else {
      diff.set(orig, undefined);
    }

    //where did we land?
    if (destPiece) {
      const dCount = +destPiece.role.split('-')[0].substring(1);
      //const dRoleLetter = destPiece.role.charAt(0);
      const dPlayerIndex = destPiece.playerIndex;
      if (dPlayerIndex === oPlayerIndex) {
        const piece = {
          role: `${oRoleLetter}${dCount + 1}-piece`,
          playerIndex: oPlayerIndex,
        } as cg.Piece;
        diff.set(dest, piece);
      } else {
        const piece = {
          role: `${oRoleLetter}1-piece`,
          playerIndex: oPlayerIndex,
        } as cg.Piece;
        diff.set(dest, piece);
      }
    } else {
      //empty space
      const piece = {
        role: `${oRoleLetter}1-piece`,
        playerIndex: oPlayerIndex,
      } as cg.Piece;
      diff.set(dest, piece);
    }
  }
  return diff;
}

export type Callback = (...args: any[]) => void;

export function callUserFunction(f: Callback | undefined, ...args: any[]): void {
  if (f) setTimeout(() => f(...args), 1);
}
