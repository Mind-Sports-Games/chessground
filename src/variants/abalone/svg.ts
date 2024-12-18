import type * as cg from '../../types';
import { DrawShapePiece, DrawBrush, DrawBrushes } from '../../draw';
import { State } from '../../state';
import {
  ArrowDests,
  Shape,
  arrowMargin,
  circleWidth,
  createElement,
  lineWidth,
  makeCustomBrush,
  opacity,
  orient,
  setAttributes,
} from '../../svg';

import { key2pos } from './util';

// @TODO: using HOF would probably fix the arrows etc. Currently not working.

// pos2px is used to convert a position from the grid (board coordinates) to a position in pixels
const pos2px = (pos: cg.Pos, bounds: ClientRect, bd: cg.BoardDimensions): cg.NumberPair => {
  return [
    ((pos[0] * 4 + pos[0] - 0.5) * bounds.width) / bd.width,
    ((bd.height + 0.5 - pos[1]) * bounds.height) / bd.height,
  ];
};

// @TODO: remove the lines below
// function pos2px(pos: cg.Pos, bounds: ClientRect, bd: cg.BoardDimensions): cg.NumberPair {
//   return [((pos[0] - 0.5) * bounds.width) / bd.width, ((bd.height + 0.5 - pos[1]) * bounds.height) / bd.height];
// }

const roleToSvgName = (piece: DrawShapePiece): string => {
  return (piece.playerIndex === 'p1' ? 'b' : 'w') + piece.role[0].toUpperCase();
};

export const renderPiece = (
  baseUrl: string,
  pos: cg.Pos,
  piece: DrawShapePiece,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
  myPlayerIndex: cg.PlayerIndex,
): SVGElement => {
  const o = pos2px(pos, bounds, bd),
    width = (bounds.width / bd.width) * (piece.scale || 1),
    height = (bounds.height / bd.height) * (piece.scale || 1),
    //name = piece.playerIndex[0] + piece.role[0].toUpperCase();
    name = roleToSvgName(piece);
  // If baseUrl doesn't end with '/' use it as full href
  // This is needed when drop piece suggestion .svg image file names are different than "name" produces
  const href = baseUrl.endsWith('/') ? baseUrl.slice('https://playstrategy.org'.length) + name + '.svg' : baseUrl;
  const side = piece.playerIndex === myPlayerIndex ? 'ally' : 'enemy';
  return setAttributes(createElement('image'), {
    className: `${piece.role} ${piece.playerIndex} ${side}`,
    x: o[0] - width / 2,
    y: o[1] - height / 2,
    width: width,
    height: height,
    href: href,
  });
};

export const renderShape = (
  state: State,
  { shape, current, hash }: Shape,
  brushes: DrawBrushes,
  arrowDests: ArrowDests,
  bounds: ClientRect,
): SVGElement => {
  let el: SVGElement;
  if (shape.customSvg) {
    const orig = orient(key2pos(shape.orig), state.orientation, state.dimensions);
    el = renderCustomSvg(shape.customSvg, orig, bounds, state.dimensions);
  } else if (shape.piece)
    el = renderPiece(
      state.drawable.pieces.baseUrl,
      orient(key2pos(shape.orig), state.orientation, state.dimensions),
      shape.piece,
      bounds,
      state.dimensions,
      state.myPlayerIndex,
    );
  else {
    const orig = orient(key2pos(shape.orig), state.orientation, state.dimensions);
    if (shape.orig && shape.dest) {
      let brush: DrawBrush = brushes[shape.brush!];
      if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
      el = renderArrow(
        brush,
        orig,
        orient(key2pos(shape.dest), state.orientation, state.dimensions),
        current,
        (arrowDests.get(shape.dest) || 0) > 1,
        bounds,
        state.dimensions,
      );
    } else el = renderCircle(brushes[shape.brush!], orig, current, bounds, state.dimensions);
  }
  el.setAttribute('cgHash', hash);
  return el;
};

function renderCircle(
  brush: DrawBrush,
  pos: cg.Pos,
  current: boolean,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): SVGElement {
  const o = pos2px(pos, bounds, bd),
    widths = circleWidth(bounds, bd),
    radius = (bounds.width + bounds.height) / (2 * (bd.height + bd.width));
  return setAttributes(createElement('circle'), {
    stroke: brush.color,
    'stroke-width': widths[current ? 0 : 1],
    fill: 'none',
    opacity: opacity(brush, current),
    cx: o[0],
    cy: o[1],
    r: radius - widths[1] / 2,
  });
}

function renderArrow(
  brush: DrawBrush,
  orig: cg.Pos,
  dest: cg.Pos,
  current: boolean,
  shorten: boolean,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): SVGElement {
  const m = arrowMargin(bounds, shorten && !current, bd),
    a = pos2px(orig, bounds, bd),
    b = pos2px(dest, bounds, bd),
    dx = b[0] - a[0],
    dy = b[1] - a[1],
    angle = Math.atan2(dy, dx),
    xo = Math.cos(angle) * m,
    yo = Math.sin(angle) * m;
  return setAttributes(createElement('line'), {
    stroke: brush.color,
    'stroke-width': lineWidth(brush, current, bounds, bd),
    'stroke-linecap': 'round',
    'marker-end': 'url(#arrowhead-' + brush.key + ')',
    opacity: opacity(brush, current),
    x1: a[0],
    y1: a[1],
    x2: b[0] - xo,
    y2: b[1] - yo,
  });
}

function renderCustomSvg(customSvg: string, pos: cg.Pos, bounds: ClientRect, bd: cg.BoardDimensions): SVGElement {
  const { width, height } = bounds;
  const w = width / bd.width;
  const h = height / bd.height;
  const x = (pos[0] - 1) * w;
  const y = (bd.height - pos[1]) * h;

  // Translate to top-left of `orig` square
  const g = setAttributes(createElement('g'), { transform: `translate(${x},${y})` });

  // Give 100x100 coordinate system to the user for `orig` square
  const svg = setAttributes(createElement('svg'), { width: w, height: h, viewBox: '0 0 100 100' });

  g.appendChild(svg);
  svg.innerHTML = customSvg;
  return g;
}
