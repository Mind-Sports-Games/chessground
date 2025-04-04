import type {HeadlessState} from '../../state';

import {baseMove, getKeyAtDomPos} from './board';
import {processDrag} from './drag';
import {validDestinations} from './premove';
import {render} from './render';
import {cellToPx, key2pos, pos2key, posToTranslateAbs, posToTranslateRel} from './util';
import {BoardDimensions, Key, Orientation, Pieces, Pos, Variant} from "../../types";

export const configure = (state: HeadlessState): void => {
	// HOF
	state.baseMove = baseMove;
	state.getKeyAtDomPos = getKeyAtDomPosBridge;
	state.getSnappedKeyAtDomPos = getSnappedKeyAtDomPosBridge;
	state.key2pos = key2pos;
	state.posToTranslateAbsolute = posToTranslateAbsBridge;
	state.posToTranslateRelative = posToTranslateRelBridge;
	state.pos2px = pos2pxBridge;
	state.pos2key = pos2key;
	state.premove = premoveBridge;
	state.processDrag = processDrag;//TODO?
	state.render = render;//TODO?
	
	// these below could just have been overriden by a config object
	state.animation.enabled = false;
};

const posToTranslateAbsBridge = (bounds: ClientRect, d: BoardDimensions, variant: Variant) =>
	(pos: Pos, orientation: Orientation) => posToTranslateAbs(variant, bounds, pos, orientation);
const posToTranslateRelBridge = (pos: Pos, orientation: Orientation, d: BoardDimensions, variant: Variant) =>
	posToTranslateRel(variant, pos, orientation);
const getKeyAtDomPosBridge = (pos: Pos, orientation: Orientation, bounds: ClientRect, d: BoardDimensions, variant: Variant) =>
	getKeyAtDomPos(variant, bounds, pos, orientation);
const getSnappedKeyAtDomPosBridge = (orig: Key, pos: Pos, orientation: Orientation, bounds: ClientRect, d: BoardDimensions, variant: Variant) =>
	getKeyAtDomPos(variant, bounds, pos, orientation);// In Abalone we do not snap arrows to valid moves
const pos2pxBridge = (pos: Pos, bounds: ClientRect, d: BoardDimensions, variant: Variant) =>
	cellToPx(variant, bounds, pos);
const premoveBridge = (pieces: Pieces, key: Key, canCastle: boolean, d: BoardDimensions, variant: Variant, chess960: boolean,): Key[] =>
	validDestinations(variant, pieces, key);