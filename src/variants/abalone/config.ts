import type { HeadlessState } from '../../state';
import type * as cg from '../../types';

import { baseMove } from './engine';
import { render } from './render';
import { pos2px } from './svg';
import { key2pos, posToTranslateAbs2 as posToTranslateAbs2Original, posToTranslateRel } from './util';

export const configure = (state: HeadlessState): void => {
  // HOF
  state.baseMove = baseMove;
  state.render = render;
  state.posToTranslateRelative = posToTranslateRel;
  state.posToTranslateAbsolute = posToTranslateAbsBridge;
  state.pos2px = pos2px;
  state.key2pos = key2pos;

  // these below could just have been overriden by a config object
  state.animation.enabled = false;
};

const posToTranslateAbsBridge =
  (bounds: ClientRect, _bt: cg.BoardDimensions, _variant: cg.Variant) =>
  (pos: cg.Pos, orientation: 'p1' | 'p2' | 'left' | 'right' | 'p1vflip') =>
    posToTranslateAbs2Original()(bounds, pos, orientation);
