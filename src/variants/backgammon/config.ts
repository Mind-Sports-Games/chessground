import type { Config } from '../../config';
import type { HeadlessState } from '../../state';
import { getKeyAtDomPos } from '../../board';
import { circleRadius, circleWidth, pos2px } from './svg';

export const configure = (state: HeadlessState, config: Config): void => {
  if (config.liftable !== undefined) {
    state.liftable.liftDests = config.liftable.liftDests ?? [];
  }
  state.highlight.lastMove = false;
  if (config.drawable !== undefined && config.drawable.enabled !== true) state.drawable.enabled = false;
  state.circleRadius = (bounds, _bd) => circleRadius(bounds, circleWidth(bounds));
  state.circleWidth = (bounds, _bd) => circleWidth(bounds);
  state.getSnappedKeyAtDomPos = (_orig, pos, orientation, bounds, bd, variant) =>
    getKeyAtDomPos(pos, orientation, bounds, bd, variant);
  state.pos2px = (pos, bounds, bd, variant, orientation) => pos2px(pos, bounds, bd, variant, orientation, state.pieces);
};
