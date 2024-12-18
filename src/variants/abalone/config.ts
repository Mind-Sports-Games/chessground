import type { HeadlessState } from '../../state';

import { baseMove } from './engine';
import { render } from './render';

export const configure = (state: HeadlessState): void => {
  // HOF
  state.baseMove = baseMove;
  state.render = render;

  // these below could just have been overriden by a config object
  state.animation.enabled = false;
};
