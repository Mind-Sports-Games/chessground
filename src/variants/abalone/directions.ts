import * as cg from '../../types';

export enum DiagonalDirectionString {
  UpLeft = 'UpLeft',
  UpRight = 'UpRight',
  DownRight = 'DownRight',
  DownLeft = 'DownLeft',
}
enum HorizontalDirectionString {
  Left = 'Left',
  Right = 'Right',
}
type DirectionString = DiagonalDirectionString | HorizontalDirectionString;

export const move = (key: cg.Key, direction: DirectionString): cg.Key | undefined => {
  const transformedKey = directionMappings[direction](key);
  if (isValidKey(transformedKey)) return transformedKey;
  return undefined;
};

export const getDirectionString = (orig: cg.Key, dest: cg.Key): DirectionString | undefined => {
  const fileDiff = orig[0].charCodeAt(0) - dest[0].charCodeAt(0);
  const rankDiff = parseInt(orig[1], 10) - parseInt(dest[1], 10);

  if (fileDiff !== 0 && rankDiff === 0) {
    return fileDiff > 0 ? HorizontalDirectionString.Left : HorizontalDirectionString.Right;
  } else if (fileDiff === 0 && rankDiff !== 0) {
    return rankDiff > 0 ? DiagonalDirectionString.DownRight : DiagonalDirectionString.UpLeft;
  } else if (fileDiff !== 0 && rankDiff !== 0) {
    if (fileDiff > 0 && rankDiff > 0) {
      return DiagonalDirectionString.DownLeft;
    } else if (fileDiff < 0 && rankDiff < 0) {
      return DiagonalDirectionString.UpRight;
    } else if (fileDiff < 0 && rankDiff > 0) {
      return DiagonalDirectionString.DownRight;
    } else {
      return DiagonalDirectionString.UpLeft;
    }
  }
  return undefined;
};

export const isMoveInLine = (orig: cg.Key, dest: cg.Key, directionString: DirectionString): boolean => {
  const pathToEdge = traverseUntil(
    orig,
    (square: cg.Key) => move(square, directionString) == undefined,
    directionString,
  );
  return pathToEdge.includes(dest);
};

export const candidateLineDirs = (origToDestDirection: DiagonalDirectionString): DirectionString[] => {
  const directionMap: { [key in DiagonalDirectionString]: DirectionString[] } = {
    [DiagonalDirectionString.UpLeft]: [HorizontalDirectionString.Left, DiagonalDirectionString.UpLeft],
    [DiagonalDirectionString.UpRight]: [
      DiagonalDirectionString.UpLeft,
      DiagonalDirectionString.UpRight,
      HorizontalDirectionString.Right,
    ],
    [DiagonalDirectionString.DownRight]: [HorizontalDirectionString.Right, DiagonalDirectionString.DownRight],
    [DiagonalDirectionString.DownLeft]: [
      DiagonalDirectionString.DownRight,
      DiagonalDirectionString.DownLeft,
      HorizontalDirectionString.Left,
    ],
  };
  return directionMap[origToDestDirection];
};

export const deducePotentialSideDirs = (
  origToDestDirection: DiagonalDirectionString,
  lineDirection: DirectionString,
): DirectionString[] => {
  switch (origToDestDirection) {
    case DiagonalDirectionString.DownLeft:
      switch (lineDirection) {
        case DiagonalDirectionString.DownLeft:
          return [HorizontalDirectionString.Left, DiagonalDirectionString.DownRight];
        case DiagonalDirectionString.DownRight:
          return [DiagonalDirectionString.DownLeft];
        case HorizontalDirectionString.Left:
          return [DiagonalDirectionString.DownLeft];
        default:
          return [];
      }
    case DiagonalDirectionString.UpRight:
      switch (lineDirection) {
        case DiagonalDirectionString.UpLeft:
          return [DiagonalDirectionString.UpRight];
        case DiagonalDirectionString.UpRight:
          return [HorizontalDirectionString.Right, DiagonalDirectionString.UpLeft];
        case HorizontalDirectionString.Right:
          return [DiagonalDirectionString.UpRight];
        default:
          return [];
      }
    case DiagonalDirectionString.UpLeft:
      switch (lineDirection) {
        case DiagonalDirectionString.UpLeft:
          return [HorizontalDirectionString.Left];
        case HorizontalDirectionString.Left:
          return [DiagonalDirectionString.UpLeft];
        default:
          return [];
      }
    case DiagonalDirectionString.DownRight:
      switch (lineDirection) {
        case DiagonalDirectionString.DownRight:
          return [HorizontalDirectionString.Right];
        case HorizontalDirectionString.Right:
          return [DiagonalDirectionString.DownRight];
        default:
          return [];
      }
    default:
      return [];
  }
};

const traverseUntil = (pos: cg.Key, stop: (pos: cg.Key) => boolean, direction: DirectionString): cg.Key[] => {
  const nextPos = move(pos, direction);
  if (nextPos) {
    const rest = stop(nextPos) ? [] : traverseUntil(nextPos, stop, direction);
    return [nextPos, ...rest];
  } else {
    return [];
  }
};

const isValidKey = (key: cg.Key): boolean => {
  if (key.length !== 2) return false; // e.g. 'e10'

  const num = Number(key[1]);
  const charCode = key[0].charCodeAt(0);

  if (num < 1 || num > 9) return false;
  if (charCode < 97 || charCode > 105) return false; // a-i

  const specificChecks: { [char: string]: [number, number] } = {
    a: [1, 5],
    b: [1, 6],
    c: [1, 7],
    d: [1, 8],
    f: [2, 9],
    g: [3, 9],
    h: [4, 9],
    i: [5, 9],
  };

  const range = specificChecks[key[0]];
  if (range && (num < range[0] || num > range[1])) return false;

  return true;
};

const directionMappings: { [key in DirectionString]: (key: cg.Key) => cg.Key } = {
  UpLeft: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0)) + (parseInt(key[1]) + 1).toString()) as cg.Key,
  UpRight: (key: cg.Key) =>
    (String.fromCharCode(key[0].charCodeAt(0) + 1) + (parseInt(key[1]) + 1).toString()) as cg.Key,
  DownLeft: (key: cg.Key) =>
    (String.fromCharCode(key[0].charCodeAt(0) - 1) + (parseInt(key[1]) - 1).toString()) as cg.Key,
  DownRight: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0)) + (parseInt(key[1]) - 1).toString()) as cg.Key,
  Left: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0) - 1) + key[1]) as cg.Key,
  Right: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0) + 1) + key[1]) as cg.Key,
};
