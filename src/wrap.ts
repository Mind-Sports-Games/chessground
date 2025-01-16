import { HeadlessState } from './state';
import { calculateBackgammonScores, setVisible, createEl, pos2key, NRanks, invNRanks } from './util';
import {
  orientations,
  files,
  ranks,
  ranks19,
  shogiVariants,
  xiangqiVariants,
  Elements,
  Notation,
  Dice,
  DoublingCube,
} from './types';
import { createElement as createSVG, setAttributes } from './svg';

export function renderWrap(element: HTMLElement, s: HeadlessState, relative: boolean): Elements {
  // .cg-wrap (element passed to Chessground)
  //   cg-helper (12.5%, display: table)
  //     cg-container (800%)
  //       cg-board
  //       svg.cg-shapes
  //         defs
  //         g
  //       svg.cg-custom-svgs
  //         g
  //       coords.ranks
  //       coords.files
  //       piece.ghost

  element.innerHTML = '';

  // ensure the cg-wrap class is set
  // so bounds calculation can use the CSS width/height values
  // add that class yourself to the element before calling chessground
  // for a slight performance improvement! (avoids recomputing style)
  element.classList.add('cg-wrap');

  for (const c of orientations) element.classList.toggle('orientation-' + c, s.orientation === c);
  element.classList.toggle('manipulable', !s.viewOnly);

  const helper = createEl('cg-helper');
  element.appendChild(helper);
  const container = createEl('cg-container');
  helper.appendChild(container);

  const extension = createEl('extension');
  container.appendChild(extension);
  const board = createEl('cg-board');
  container.appendChild(board);

  let svg: SVGElement | undefined;
  let customSvg: SVGElement | undefined;
  if (s.drawable.visible && !relative) {
    svg = setAttributes(createSVG('svg'), { class: 'cg-shapes' });
    svg.appendChild(createSVG('defs'));
    svg.appendChild(createSVG('g'));
    customSvg = setAttributes(createSVG('svg'), { class: 'cg-custom-svgs' });
    customSvg.appendChild(createSVG('g'));
    container.appendChild(svg);
    container.appendChild(customSvg);
  }

  if (s.coordinates) {
    const orientClass = ' ' + s.orientation;
    const shogi = shogiVariants.includes(s.variant);
    const xiangqi = xiangqiVariants.includes(s.variant);
    if (shogi) {
      container.appendChild(renderCoords(ranks.slice(0, s.dimensions.height).reverse(), 'files' + orientClass));
      container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width).reverse(), 'ranks' + orientClass));
    } else if (s.notation === Notation.JANGGI) {
      container.appendChild(renderCoords(['0'].concat(ranks.slice(0, 9).reverse()), 'ranks' + orientClass));
      container.appendChild(renderCoords(ranks.slice(0, 9), 'files' + orientClass));
    } else if (xiangqi) {
      if (s.orientation === 'p1') {
        container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.width).reverse(), 'files' + ' p1'));
        container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.width).reverse(), 'files' + ' p2'));
      } else {
        container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.width), 'files' + ' p1'));
        container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.width), 'files' + ' p2'));
      }
    } else if (s.variant === 'flipello' || s.variant === 'flipello10') {
      container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.height).reverse(), 'ranks' + orientClass));
      container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + orientClass));
    } else if (s.variant === 'oware') {
      if (s.orientation === 'p1') {
        container.appendChild(
          renderCoords(
            files.slice(0, s.dimensions.width).map(x => x.toUpperCase()),
            'files' + ' p1',
          ),
        );
        container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + ' p2'));
      } else {
        container.appendChild(
          renderCoords(
            files
              .slice(0, s.dimensions.width)
              .map(x => x.toUpperCase())
              .reverse(),
            'files' + ' p1',
          ),
        );
        container.appendChild(renderCoords(files.slice(0, s.dimensions.width).reverse(), 'files' + ' p2'));
      }
    } else if (s.variant === 'togyzkumalak' || s.variant === 'bestemshe') {
      if (s.orientation === 'p1') {
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width), 'files' + ' p1'));
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width), 'files' + ' p2'));
      } else {
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width).reverse(), 'files' + ' p1'));
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width).reverse(), 'files' + ' p2'));
      }
    } else if (s.variant === 'backgammon' || s.variant === 'hyper' || s.variant === 'nackgammon') {
      if (s.orientation === 'p1') {
        if (s.turnPlayerIndex === 'p1') {
          container.appendChild(
            renderCoords(['13', '14', '15', '16', '17', '18', '', '19', '20', '21', '22', '23', '24'], 'files' + ' p2'),
          );
          container.appendChild(
            renderCoords(
              ['1', '2', '3', '4', '5', '6', '', '7', '8', '9', '10', '11', '12'].reverse(),
              'files' + ' p1',
            ),
          );
        } else {
          container.appendChild(
            renderCoords(['13', '14', '15', '16', '17', '18', '', '19', '20', '21', '22', '23', '24'], 'files' + ' p1'),
          );
          container.appendChild(
            renderCoords(
              ['1', '2', '3', '4', '5', '6', '', '7', '8', '9', '10', '11', '12'].reverse(),
              'files' + ' p2',
            ),
          );
        }
      } else {
        if (s.turnPlayerIndex === 'p1') {
          container.appendChild(
            renderCoords(
              ['1', '2', '3', '4', '5', '6', '', '7', '8', '9', '10', '11', '12'].reverse(),
              'files' + ' p1',
            ),
          );
          container.appendChild(
            renderCoords(['13', '14', '15', '16', '17', '18', '', '19', '20', '21', '22', '23', '24'], 'files' + ' p2'),
          );
        } else {
          container.appendChild(
            renderCoords(
              ['1', '2', '3', '4', '5', '6', '', '7', '8', '9', '10', '11', '12'].reverse(),
              'files' + ' p2',
            ),
          );
          container.appendChild(
            renderCoords(['13', '14', '15', '16', '17', '18', '', '19', '20', '21', '22', '23', '24'], 'files' + ' p1'),
          );
        }
      }
    } else if (s.variant === 'abalone') {
      if (s.orientation === 'p1') {
        container.appendChild(renderCoords(ranks.slice(0, 5), 'files' + orientClass + ' rank-1'));
        container.appendChild(renderCoords(['6'], 'files' + orientClass + ' rank-2'));
        container.appendChild(renderCoords(['7'], 'files' + orientClass + ' rank-3'));
        container.appendChild(renderCoords(['8'], 'files' + orientClass + ' rank-4'));
        container.appendChild(renderCoords(['9'], 'files' + orientClass + ' rank-5'));
        container.appendChild(renderCoords(['e'], 'ranks' + orientClass + ' file-1'));
        container.appendChild(renderCoords(['d', 'f'], 'ranks' + orientClass + ' file-2'));
        container.appendChild(renderCoords(['c', 'g'], 'ranks' + orientClass + ' file-3'));
        container.appendChild(renderCoords(['b', '', 'h'], 'ranks' + orientClass + ' file-4'));
        container.appendChild(renderCoords(['a', '', '', '', 'i'], 'ranks' + orientClass + ' file-5'));
      } else {
        container.appendChild(renderCoords(ranks.slice(0, 5), 'files' + orientClass + ' rank-1'));
        container.appendChild(renderCoords(['6'], 'files' + orientClass + ' rank-2'));
        container.appendChild(renderCoords(['7'], 'files' + orientClass + ' rank-3'));
        container.appendChild(renderCoords(['8'], 'files' + orientClass + ' rank-4'));
        container.appendChild(renderCoords(['9'], 'files' + orientClass + ' rank-5'));
        container.appendChild(renderCoords(['e'], 'ranks' + orientClass + ' file-1'));
        container.appendChild(renderCoords(['d', 'f'], 'ranks' + orientClass + ' file-2'));
        container.appendChild(renderCoords(['c', 'g'], 'ranks' + orientClass + ' file-3'));
        container.appendChild(renderCoords(['b', '', 'h'], 'ranks' + orientClass + ' file-4'));
        container.appendChild(renderCoords(['a', '', '', '', 'i'], 'ranks' + orientClass + ' file-5'));
      }
    } else {
      container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.height), 'ranks' + orientClass));
      container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + orientClass));
    }
  }

  if (s.boardScores) {
    const bd = s.dimensions;
    if (s.variant === 'togyzkumalak' || s.variant === 'bestemshe') {
      const boardScores = invNRanks.slice(-bd.height).map(y =>
        NRanks.slice(0, bd.width).map(x => {
          const piece = s.pieces.get(pos2key([x, y]));
          if (piece) {
            if (piece.role === 't-piece') {
              return 't';
            } else return piece.role.split('-')[0].substring(1);
          } else return '0';
        }),
      );

      if (s.orientation === 'p1') {
        container.appendChild(renderTogyBoardScores(boardScores[1], 'p1'));
        container.appendChild(renderTogyBoardScores(boardScores[0], 'p2'));
      } else {
        container.appendChild(renderTogyBoardScores(boardScores[1].reverse(), 'p1'));
        container.appendChild(renderTogyBoardScores(boardScores[0].reverse(), 'p2'));
      }
    } else if (s.variant === 'backgammon' || s.variant === 'hyper' || s.variant === 'nackgammon') {
      const boardScores = calculateBackgammonScores(s.pieces, s.pocketPieces, s.dimensions);
      container.appendChild(renderBoardScores(boardScores.p1.toString(), 'p1'));
      container.appendChild(renderBoardScores(boardScores.p2.toString(), 'p2'));
    } else {
      container.appendChild(renderBoardScores('0', s.orientation));
    }
  }

  if (s.variant === 'backgammon' || s.variant === 'hyper' || s.variant === 'nackgammon') {
    if (s.doublingCube) {
      container.appendChild(renderDoublingCube(s.doublingCube));
      if (s.cubeActions) {
        if (s.cubeActions.includes('offer'))
          container.appendChild(
            renderCubeAction('double', s.turnPlayerIndex + ' left', s.turnPlayerIndex === s.myPlayerIndex),
          );
        if (s.cubeActions.includes('offer'))
          container.appendChild(
            renderCubeAction('roll', s.turnPlayerIndex + ' right', s.turnPlayerIndex === s.myPlayerIndex),
          );
        if (s.cubeActions.includes('reject'))
          container.appendChild(
            renderCubeAction('drop', s.turnPlayerIndex + ' left', s.turnPlayerIndex === s.myPlayerIndex),
          );
        if (s.cubeActions.includes('accept'))
          container.appendChild(
            renderCubeAction('take', s.turnPlayerIndex + ' right', s.turnPlayerIndex === s.myPlayerIndex),
          );
      }
    }
    if (s.multiPointState) {
      container.appendChild(renderMultiPointTarget(s.multiPointState.target));
      container.appendChild(renderMultiPointPlayerScore(s.multiPointState.p1, 'p1'));
      container.appendChild(renderMultiPointPlayerScore(s.multiPointState.p2, 'p2'));
    }
  }
  if (s.dice.length > 0) {
    container.appendChild(renderDice(s.dice, s.turnPlayerIndex));
    if (s.showUndoButton) {
      container.appendChild(renderUndoButton(s.canUndo, s.turnPlayerIndex + ' left'));
    }
  }

  let ghost: HTMLElement | undefined;
  if (s.draggable.showGhost && !relative) {
    ghost = createEl('piece', 'ghost');
    setVisible(ghost, false);
    container.appendChild(ghost);
  }

  return {
    board,
    container,
    ghost,
    svg,
    customSvg,
  };
}

function renderBoardScores(score: string, className: string): HTMLElement {
  const el = createEl('board-scores', className);
  const f: HTMLElement = createEl('board-score');
  f.textContent = score;
  el.appendChild(f);
  return el;
}

function renderTogyBoardScores(elems: readonly string[], className: string): HTMLElement {
  const el = createEl('board-scores', className);
  let f, g: HTMLElement;
  for (const elem of elems) {
    f = createEl('position-score');
    switch (elem) {
      case 't': {
        g = createEl('score', 'tuzdik');
        f.appendChild(g);
        break;
      }
      case '0': {
        g = createEl('score', 'empty');
        f.appendChild(g);
        break;
      }
      default: {
        const extraClassNames =
          (parseInt(elem, 10) % 2 === 1 ? 'odd' : '') + (parseInt(elem, 10) > 20 ? ' abundance' : '');
        g = createEl('score', extraClassNames);
        g.textContent = elem;
        f.appendChild(g);
      }
    }
    el.appendChild(f);
  }
  return el;
}

function renderMultiPointPlayerScore(score: number, playerIndex: string): HTMLElement {
  const el = createEl('cg-multi-point-score', playerIndex);
  el.textContent = score.toString();
  return el;
}

function renderMultiPointTarget(target: number): HTMLElement {
  const el = createEl('cg-multi-point-target');
  el.textContent = target.toString() + 'pt';
  return el;
}

function renderDoublingCube(dCube: DoublingCube): HTMLElement {
  const el = createEl('cg-doubling-cube', dCube.owner);
  const doubeCubeClass = ['zero', 'one', 'two', 'three', 'four', 'five', 'six'];
  const cube = createEl('cube', doubeCubeClass[dCube.value]);
  el.appendChild(cube);
  return el;
}

function renderDice(dice: Dice[], className: string): HTMLElement {
  const el = createEl('cg-dice', className);
  const diceClass = ['one', 'two', 'three', 'four', 'five', 'six'];
  let d: HTMLElement;
  for (const elem of dice) {
    d = createEl('dice', diceClass[elem.value - 1] + (elem.isAvailable ? ' available' : ' unavailable'));
    el.appendChild(d);
  }
  return el;
}

function renderUndoButton(canUndo: boolean, className: string): HTMLElement {
  const el = createEl('cg-buttons', className);
  const d: HTMLElement = createEl('cg-button', 'undo ' + (canUndo ? 'available' : 'unavailable'));
  d.textContent = 'UNDO';
  el.appendChild(d);
  return el;
}

function renderCubeAction(cubeAction: string, className: string, myButton: boolean): HTMLElement {
  const el = createEl('cg-buttons', className);
  const d: HTMLElement = createEl('cg-button', cubeAction + (myButton ? ' available' : ' unavailable'));
  d.textContent = cubeAction.toUpperCase();
  el.appendChild(d);
  return el;
}

function renderCoords(elems: readonly string[], className: string): HTMLElement {
  const el = createEl('coords', className);
  let f: HTMLElement;
  for (const elem of elems) {
    f = createEl('coord');
    f.textContent = elem;
    el.appendChild(f);
  }
  return el;
}
