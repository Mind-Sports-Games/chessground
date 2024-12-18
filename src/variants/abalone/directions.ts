import type * as cg from '../../types';

import type { DirectionString } from './types';

export enum DiagonalDirectionString {
  UpLeft = 'NW',
  UpRight = 'NE',
  DownRight = 'SE',
  DownLeft = 'SW',
}
export enum HorizontalDirectionString {
  Left = 'W',
  Right = 'E',
}

export const inverseDirection = (direction: DirectionString): DirectionString => {
  switch (direction) {
    case DiagonalDirectionString.UpLeft:
      return DiagonalDirectionString.DownRight;
    case DiagonalDirectionString.UpRight:
      return DiagonalDirectionString.DownLeft;
    case DiagonalDirectionString.DownRight:
      return DiagonalDirectionString.UpLeft;
    case DiagonalDirectionString.DownLeft:
      return DiagonalDirectionString.UpRight;
    case HorizontalDirectionString.Left:
      return HorizontalDirectionString.Right;
    case HorizontalDirectionString.Right:
      return HorizontalDirectionString.Left;
  }
};

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
  return /^(a[1-5]|b[1-6]|c[1-7]|d[1-8]|e[1-9]|f[2-9]|g[3-9]|h[4-9]|i[5-9])$/.test(key);
};

const directionMappings: { [key in DirectionString]: (key: cg.Key) => cg.Key } = {
  NW: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0)) + (parseInt(key[1]) + 1).toString()) as cg.Key,
  NE: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0) + 1) + (parseInt(key[1]) + 1).toString()) as cg.Key,
  SW: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0) - 1) + (parseInt(key[1]) - 1).toString()) as cg.Key,
  SE: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0)) + (parseInt(key[1]) - 1).toString()) as cg.Key,
  W: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0) - 1) + key[1]) as cg.Key,
  E: (key: cg.Key) => (String.fromCharCode(key[0].charCodeAt(0) + 1) + key[1]) as cg.Key,
};
