import { getKeyAtDomPos, getSnappedKeyAtDomPos } from '../src/board';
import { NumberPair, BoardDimensions } from '../src/types';
import { expect } from 'chai';

describe('getSnappedKeyAtDomPos() test', () => {
  it('testing a8 squares p1', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const snappedKey = getSnappedKeyAtDomPos('a8', bpos, orientation, bounds, bd);
    expect(expected).to.equal(snappedKey);
  });
});

describe('getSnappedKeyAtDomPos() test', () => {
  it('testing h1 squares p2', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'p2';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const snappedKey = getSnappedKeyAtDomPos('h1', bpos, orientation, bounds, bd);
    expect(expected).to.equal(snappedKey);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares p1', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares p1', () => {
    const bpos: NumberPair = [0.5, 7.5];
    const orientation = 'p1';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares p1', () => {
    const bpos: NumberPair = [7.5, 7.5];
    const orientation = 'p1';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares p1', () => {
    const bpos: NumberPair = [7.5, 0.5];
    const orientation = 'p1';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares p2', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'p2';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares p2', () => {
    const bpos: NumberPair = [0.5, 7.5];
    const orientation = 'p2';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares p2', () => {
    const bpos: NumberPair = [7.5, 7.5];
    const orientation = 'p2';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares p2', () => {
    const bpos: NumberPair = [7.5, 0.5];
    const orientation = 'p2';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares right', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'right';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares right', () => {
    const bpos: NumberPair = [0.5, 7.5];
    const orientation = 'right';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares right', () => {
    const bpos: NumberPair = [7.5, 7.5];
    const orientation = 'right';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares right', () => {
    const bpos: NumberPair = [7.5, 0.5];
    const orientation = 'right';
    const bounds = {
      height: 8,
      width: 8,
      x: 0,
      y: 0,
      bottom: 8,
      left: 0,
      right: 8,
      top: 0,
      toJSON(): any {
        return 'None';
      },
    };
    const bd: BoardDimensions = { width: 8, height: 8 };

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, bd);
    expect(expected).to.equal(key);
  });
});
