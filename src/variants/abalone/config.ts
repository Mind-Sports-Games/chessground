import type { HeadlessState } from '../../state';
import type * as cg from '../../types';

import { getKeyAtDomPos, getSnappedKeyAtDomPos } from './board';
import { processDrag } from './drag';
import { baseMove } from './engine';
import { render } from './render';
import { pos2px } from './svg';
import { key2pos, posToTranslateAbs2 as posToTranslateAbs2Original, posToTranslateRel, pos2key } from './util';

export const configure = (state: HeadlessState): void => {
  // HOF
  state.baseMove = baseMove;
  state.getKeyAtDomPos = getKeyAtDomPos;
  state.getSnappedKeyAtDomPos = getSnappedKeyAtDomPos;
  state.key2pos = key2pos;
  state.posToTranslateAbsolute = posToTranslateAbsBridge;
  state.posToTranslateRelative = posToTranslateRel;
  state.pos2px = pos2px;
  state.pos2key = pos2key;
  state.processDrag = processDrag;
  state.render = render;

  // these below could just have been overriden by a config object
  state.animation.enabled = false;
};

const posToTranslateAbsBridge =
  (bounds: ClientRect, _bt: cg.BoardDimensions, _variant: cg.Variant) =>
  (pos: cg.Pos, orientation: 'p1' | 'p2' | 'left' | 'right' | 'p1vflip') =>
    posToTranslateAbs2Original()(bounds, pos, orientation);
