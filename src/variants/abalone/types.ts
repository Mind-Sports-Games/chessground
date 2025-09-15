import type * as cg from '../../types';
import { Key } from '../../types';

import { DiagonalDirectionString, HorizontalDirectionString } from './directions';

export type DirectionString = DiagonalDirectionString | HorizontalDirectionString;

export type MoveImpact = {
  diff: cg.PiecesDiff; // Diff applied to pieces after the move
  capture: boolean;
  landingSquares: Key[];
};

// Allows describing a move in terms of direction applied to some pieces (the direction is used in CSS)
export type MoveVector = {
  directionString: DirectionString;
  landingSquares: Key[];
};

export type SquareDimensions = {
  width: number;
  height: number;
};
