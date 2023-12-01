import { HeadlessState } from './state';
import { setVisible, createEl, pos2key, NRanks, invNRanks } from './util';
import { orientations, files, ranks, ranks19, shogiVariants, xiangqiVariants, Elements, Notation } from './types';
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
            'files' + ' p1'
          )
        );
        container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + ' p2'));
      } else {
        container.appendChild(
          renderCoords(
            files
              .slice(0, s.dimensions.width)
              .map(x => x.toUpperCase())
              .reverse(),
            'files' + ' p1'
          )
        );
        container.appendChild(renderCoords(files.slice(0, s.dimensions.width).reverse(), 'files' + ' p2'));
      }
    } else if (s.variant === 'togyzkumalak') {
      if (s.orientation === 'p1') {
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width), 'files' + ' p1'));
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width), 'files' + ' p2'));
      } else {
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width).reverse(), 'files' + ' p1'));
        container.appendChild(renderCoords(ranks.slice(0, s.dimensions.width).reverse(), 'files' + ' p2'));
      }
    } else if (s.variant === 'backgammon') {
      if (s.orientation === 'p1') {
        container.appendChild(
          renderCoords(['1', '2', '3', '4', '5', '6', '', '7', '8', '9', '10', '11', '12'].reverse(), 'files' + ' p2')
        );
        container.appendChild(
          renderCoords(['13', '14', '15', '16', '17', '18', '', '19', '20', '21', '22', '23', '24'], 'files' + ' p1')
        );
      } else {
        container.appendChild(
          renderCoords(['1', '2', '3', '4', '5', '6', '', '7', '8', '9', '10', '11', '12'], 'files' + ' p2')
        );
        container.appendChild(
          renderCoords(
            ['13', '14', '15', '16', '17', '18', '', '19', '20', '21', '22', '23', '24'].reverse(),
            'files' + ' p1'
          )
        );
      }
    } else {
      container.appendChild(renderCoords(ranks19.slice(0, s.dimensions.height), 'ranks' + orientClass));
      container.appendChild(renderCoords(files.slice(0, s.dimensions.width), 'files' + orientClass));
    }
  }

  if (s.boardScores) {
    const bd = s.dimensions;
    if (s.variant === 'togyzkumalak') {
      const boardScores = invNRanks.slice(-bd.height).map(y =>
        NRanks.slice(0, bd.width).map(x => {
          const piece = s.pieces.get(pos2key([x, y]));
          if (piece) {
            if (piece.role === 't-piece') {
              return 't';
            } else return piece.role.split('-')[0].substring(1);
          } else return '0';
        })
      );

      if (s.orientation === 'p1') {
        container.appendChild(renderBoardScores(boardScores[1], 'p1'));
        container.appendChild(renderBoardScores(boardScores[0], 'p2'));
      } else {
        container.appendChild(renderBoardScores(boardScores[1].reverse(), 'p1'));
        container.appendChild(renderBoardScores(boardScores[0].reverse(), 'p2'));
      }
    } else {
      container.appendChild(renderBoardScores(files.slice(0, s.dimensions.width), s.orientation));
    }
  }

  if (s.dice.length > 0) container.appendChild(renderDice(s.dice, s.turnPlayerIndex));

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

function renderBoardScores(elems: readonly string[], className: string): HTMLElement {
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

function renderDice(elems: readonly number[], className: string): HTMLElement {
  const el = createEl('cg-dice', className);
  const diceClass = ['one', 'two', 'three', 'four', 'five', 'six'];
  let d: HTMLElement;
  for (const elem of elems) {
    d = createEl('dice', diceClass[elem - 1]);
    el.appendChild(d);
  }
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
