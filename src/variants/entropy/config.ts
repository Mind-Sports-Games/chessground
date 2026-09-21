import type { HeadlessState } from '../../state';

import { getKeyAtDomPos } from '../../board';
import { BoardDimensions, Key, NumberPair, Orientation, Variant } from '../../types';

export const configure = (state: HeadlessState): void => {
  // HOF
  state.getSnappedKeyAtDomPos = getSnappedKeyAtDomPosBridge;
};

const getSnappedKeyAtDomPosBridge = (
  _orig: Key,
  pos: NumberPair,
  orientation: Orientation,
  bounds: ClientRect,
  bd: BoardDimensions,
  variant: Variant,
) => getKeyAtDomPos(pos, orientation, bounds, bd, variant); // In Entropy we do not snap arrows to valid moves
