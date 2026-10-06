import { describe, expect, it } from '@jest/globals';
import { read } from '../../fen.js';
import { findPatterns, totalPoints, qualifies, lineScores } from './patterns.js';
import * as cg from '../../types.js';

const bd: cg.BoardDimensions = { width: 7, height: 7 };
const patternsOf = (board: string) => findPatterns(read(board, bd, 'entropy'), bd);
const scoreOf = (board: string) => totalPoints(patternsOf(board));

describe('entropy qualifies()', () => {
  const w = 'w-piece' as cg.Role;
  const k = 'k-piece' as cg.Role;
  const y = 'y-piece' as cg.Role;

  it('takes a mirrored run of two or more', () => {
    expect(qualifies([w, w])).toEqual(true);
    expect(qualifies([w, k, w])).toEqual(true);
    expect(qualifies([w, k, k, w])).toEqual(true);
  });
  it('rejects a run that does not read the same both ways', () => {
    expect(qualifies([w, k])).toEqual(false);
    expect(qualifies([w, k, y])).toEqual(false);
  });
  it('allows one gap at the dead centre of an odd run, and nowhere else', () => {
    expect(qualifies([w, undefined, w])).toEqual(true);
    expect(qualifies([w, k, undefined, k, w])).toEqual(true);
    expect(qualifies([w, undefined, undefined, w])).toEqual(false);
    expect(qualifies([undefined, k, w])).toEqual(false);
    expect(qualifies([w, undefined, k, w, w])).toEqual(false);
  });
});

describe('entropy lineScores()', () => {
  const scoresOf = (board: string) => lineScores(patternsOf(board), bd);

  it('gives every line a figure, nothing scored included', () => {
    const scores = scoresOf('7/7/7/7/7/7/7');
    expect(scores.ranks).toEqual([0, 0, 0, 0, 0, 0, 0]);
    expect(scores.files).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('books a pattern to the line it runs along, by rank and by file', () => {
    // WKYKW on rank 1 scores 5 for itself and 3 for the KYK inside it
    const scores = scoresOf('7/7/7/7/7/7/WKYKW2');
    expect(scores.ranks).toEqual([8, 0, 0, 0, 0, 0, 0]);
    expect(scores.files).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('books a pattern down a file to that file', () => {
    // a1, a2, a3 all white: aa, aa and aaa, all in file a
    const scores = scoresOf('7/7/7/7/W6/W6/W6');
    expect(scores.files).toEqual([7, 0, 0, 0, 0, 0, 0]);
    expect(scores.ranks).toEqual([0, 0, 0, 0, 0, 0, 0]);
  });

  it('adds up to the score of the whole board', () => {
    const board = 'WKYKW2/7/7/7/W6/W6/WWWWWWW';
    const scores = scoresOf(board);
    const summed = [...scores.ranks, ...scores.files].reduce((a, b) => a + b, 0);
    expect(summed).toEqual(totalPoints(patternsOf(board)));
  });
});

describe('entropy findPatterns()', () => {
  it('finds nothing on an empty board', () => {
    expect(patternsOf('7/7/7/7/7/7/7')).toEqual([]);
  });

  it('scores a lone pair as two, once', () => {
    const patterns = patternsOf('7/7/7/7/7/7/WW5');
    expect(patterns.length).toEqual(1);
    expect(patterns[0].points).toEqual(2);
    expect(patterns[0].from).toEqual([1, 1]);
    expect(patterns[0].to).toEqual([2, 1]);
  });

  it('pays a nested pattern as well as the pattern that contains it', () => {
    // WKYKW scores 5 for itself and 3 for the KYK inside it
    const patterns = patternsOf('7/7/7/7/7/7/WKYKW2');
    expect(patterns.map(p => p.points).sort()).toEqual([3, 5]);
    expect(totalPoints(patterns)).toEqual(8);
  });

  it('counts a pattern down a column as well as along a row', () => {
    expect(scoreOf('7/7/7/7/W6/W6/W6')).toEqual(7); // WW, WW and WWW
  });

  it('reads through a gap at the centre of an odd run before the board is full', () => {
    expect(scoreOf('7/7/7/7/7/7/W1W4')).toEqual(3);
  });

  it('ignores who owns a counter and reads only its colour', () => {
    expect(scoreOf('7/7/7/7/7/7/Ww5')).toEqual(2);
  });

  it('scores every mirrored sub-run of a line of one colour', () => {
    // seven of a colour along one line: every run of two or more reads the same both ways
    expect(scoreOf('7/7/7/7/7/7/WWWWWWW')).toEqual(12 + 15 + 16 + 15 + 12 + 7);
  });
});
