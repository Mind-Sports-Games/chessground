import type * as cg from '../../types';
import {File, Rank} from "../../types";

import {DiagonalDirectionString, HorizontalDirectionString} from './directions';

export type Key = `${Rank}${File}`;

export type DirectionString = DiagonalDirectionString | HorizontalDirectionString;

export type MoveImpact = {
	diff: cg.PiecesDiff; // diff applied to pieces after the move
	capture: boolean;
	moveVector: MoveVector;
};

// allow describing a move in terms of direction applied to some pieces
export type MoveVector = {
	directionString: DirectionString;
	landingSquares: cg.Key[];
};

export type SquareDimensions = {
	width: number;
	height: number;
};

export type TranslateBase = (pos: cg.Pos, bounds: ClientRect) => cg.NumberPair;
