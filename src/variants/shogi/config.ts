import type { HeadlessState } from '../../state';
import { roleToSvgName } from './svg';

export const configure = (state: HeadlessState): void => {
  // HOF
  state.roleToSvgName = roleToSvgName;
};
