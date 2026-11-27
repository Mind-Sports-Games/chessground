import { describe, expect, it } from '@jest/globals';
import { start } from './api.js';
import { State, defaults } from './state.js';
import { memo } from './util.js';

describe('getKeyAtDomPos()', () => {
  it('finds the square where the board is now, after it moved without resizing', () => {
    let top = 0;
    const s = defaults() as State;
    s.dom = { bounds: memo(() => ({ left: 0, top, width: 800, height: 800 }) as DOMRect) } as State['dom'];
    const api = start(s, () => s);
    expect(api.getKeyAtDomPos([50, 750])).toEqual('a1');
    top = -100;
    expect(api.getKeyAtDomPos([50, 650])).toEqual('a1');
  });
});
