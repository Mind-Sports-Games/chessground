import type { Config } from '../../config';
import type { HeadlessState } from '../../state';

export const configure = (state: HeadlessState, config: Config): void => {
  state.liftable.liftDests = config.liftable?.liftDests || [];
};
