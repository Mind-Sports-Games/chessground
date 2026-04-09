import type { Config } from '../../config';
import type { HeadlessState } from '../../state';
import { getKeyAtDomPos } from '../../board';
import { pos2px } from './svg';

export const configure = (state: HeadlessState, config: Config): void => {
  state.liftable.liftDests = config.liftable?.liftDests || [];
  state.highlight.lastMove = false;
  if (config.drawable !== undefined && config.drawable.enabled !== true) state.drawable.enabled = false;
  state.pos2px = (pos, bounds, bd, variant, orientation) => pos2px(pos, bounds, bd, variant, orientation, state.pieces);
  state.getSnappedKeyAtDomPos = (_orig, pos, orientation, bounds, bd, variant) =>
    getKeyAtDomPos(pos, orientation, bounds, bd, variant);
};
