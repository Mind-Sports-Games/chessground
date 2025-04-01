import type {HeadlessState} from '../../state';
import {BoardDimensions, Orientation, Pos, Variant} from "../../types";

import {baseMove, getKeyAtDomPos, getSnappedKeyAtDomPos} from './board';
import {processDrag} from './drag';
import {premove} from './premove';
import {render} from './render';
import {pos2px} from './svg';
import {key2pos, pos2key, posToTranslateAbs, posToTranslateRel} from './util';
import * as cg from "../../types";

export const configure = (state: HeadlessState): void => {
	// HOF
	state.baseMove = baseMove;
	state.getKeyAtDomPos = getKeyAtDomPos;
	state.getSnappedKeyAtDomPos = getSnappedKeyAtDomPos;
	state.key2pos = key2pos;
	state.posToTranslateAbsolute = posToTranslateAbsBridge;
	state.posToTranslateRelative = posToTranslateRelBridge;
	state.pos2px = pos2px;
	state.pos2key = pos2key;
	state.premove = premove;
	state.processDrag = processDrag;
	state.render = render;
	
	// these below could just have been overriden by a config object
	state.animation.enabled = false;
};

const posToTranslateAbsBridge =
	(bounds: ClientRect, d: BoardDimensions, variant: Variant) =>
		(pos: Pos, orientation: 'p1' | 'p2' | 'left' | 'right' | 'p1vflip') =>
			posToTranslateAbs(bounds, variant, pos, orientation);

const posToTranslateRelBridge =
	(pos: Pos, orientation: Orientation, d: BoardDimensions, variant: Variant) =>
		(pos: Pos, orientation: 'p1' | 'p2' | 'left' | 'right' | 'p1vflip') =>
			posToTranslateRel(variant, pos, orientation);
