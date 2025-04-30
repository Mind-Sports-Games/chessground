import type { Role } from '../../types';

export type UnpromotedShogiPieceRole = Role &
  ('p-piece' | 'l-piece' | 'n-piece' | 's-piece' | 'r-piece' | 'b-piece' | 'g-piece' | 'k-piece');
export type PromotedShogiPieceRole = Role &
  ('pp-piece' | 'pl-piece' | 'pn-piece' | 'ps-piece' | 'pr-piece' | 'pb-piece');
export type ShogiRole = UnpromotedShogiPieceRole | PromotedShogiPieceRole;
