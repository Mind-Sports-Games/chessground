import { Geometry } from '../src/types';
import { getKeyAtDomPos, getSnappedKeyAtDomPos } from '../src/board';
import { NumberPair } from '../src/types';
import { expect } from 'chai';

describe('getSnappedKeyAtDomPos() test', () => {
  it('testing a8 squares white', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'white';
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
    const geom = Geometry.dim8x8;

    const expected = 'a8';
    const snappedKey = getSnappedKeyAtDomPos('a8', bpos, orientation, bounds, geom);
    expect(expected).to.equal(snappedKey);
  });
});

describe('getSnappedKeyAtDomPos() test', () => {
  it('testing h1 squares black', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'black';
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
    const geom = Geometry.dim8x8;

    const expected = 'h1';
    const snappedKey = getSnappedKeyAtDomPos('h1', bpos, orientation, bounds, geom);
    expect(expected).to.equal(snappedKey);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares white', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'white';
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
    const geom = Geometry.dim8x8;

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares white', () => {
    const bpos: NumberPair = [0.5, 7.5];
    const orientation = 'white';
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
    const geom = Geometry.dim8x8;

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares white', () => {
    const bpos: NumberPair = [7.5, 7.5];
    const orientation = 'white';
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
    const geom = Geometry.dim8x8;

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares white', () => {
    const bpos: NumberPair = [7.5, 0.5];
    const orientation = 'white';
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
    const geom = Geometry.dim8x8;

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a8 squares black', () => {
    const bpos: NumberPair = [0.5, 0.5];
    const orientation = 'black';
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
    const geom = Geometry.dim8x8;

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing a1 squares black', () => {
    const bpos: NumberPair = [0.5, 7.5];
    const orientation = 'black';
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
    const geom = Geometry.dim8x8;

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h1 squares black', () => {
    const bpos: NumberPair = [7.5, 7.5];
    const orientation = 'black';
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
    const geom = Geometry.dim8x8;

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});

describe('getKeyAtDomPos() test', () => {
  it('testing h8 squares black', () => {
    const bpos: NumberPair = [7.5, 0.5];
    const orientation = 'black';
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
    const geom = Geometry.dim8x8;

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
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
    const geom = Geometry.dim8x8;

    const expected = 'a1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
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
    const geom = Geometry.dim8x8;

    const expected = 'h1';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
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
    const geom = Geometry.dim8x8;

    const expected = 'h8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
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
    const geom = Geometry.dim8x8;

    const expected = 'a8';
    const key = getKeyAtDomPos(bpos, orientation, bounds, geom);
    expect(expected).to.equal(key);
  });
});
