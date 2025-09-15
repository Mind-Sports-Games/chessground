import { Pos } from '../../types';

import type { DirectionString } from './types';
import { getAngle360, norm, vectTo3 } from './util';

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

export const getDirectionString = (vect: Pos): DirectionString | undefined => {
  if (norm(vect) == 1) {
    const angle = Math.round(10000 * getAngle360(vectTo3(vect))) / 10000;
    if (angle < 60) return HorizontalDirectionString.Right;
    if (angle < 120) return DiagonalDirectionString.UpRight;
    if (angle < 180) return DiagonalDirectionString.UpLeft;
    if (angle < 240) return HorizontalDirectionString.Left;
    if (angle < 300) return DiagonalDirectionString.DownLeft;
    return DiagonalDirectionString.DownRight;
  }

  return undefined;
};
