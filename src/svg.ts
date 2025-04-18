import { State } from './state';
import { Drawable, DrawShape, DrawShapePiece, DrawBrush, DrawBrushes, DrawModifiers } from './draw';
import * as cg from './types';
import * as T from './transformations';

export function createElement(tagName: string): SVGElement {
  return document.createElementNS('http://www.w3.org/2000/svg', tagName);
}

interface Shape {
  shape: DrawShape;
  current: boolean;
  hash: Hash;
}

type CustomBrushes = Map<string, DrawBrush>; // by hash

type ArrowDests = Map<cg.Key, number>; // how many arrows land on a square

type Hash = string;

export function renderSvg(state: State, svg: SVGElement, customSvg: SVGElement): void {
  const d = state.drawable,
    curD = d.current,
    cur = curD && curD.mouseSq ? (curD as DrawShape) : undefined,
    arrowDests: ArrowDests = new Map(),
    bounds = state.dom.bounds();

  for (const s of d.shapes.concat(d.autoShapes).concat(cur ? [cur] : [])) {
    if (s.dest) arrowDests.set(s.dest, (arrowDests.get(s.dest) || 0) + 1);
  }

  const shapes: Shape[] = d.shapes.concat(d.autoShapes).map((s: DrawShape) => {
    return {
      shape: s,
      current: false,
      hash: shapeHash(s, arrowDests, false, bounds),
    };
  });
  if (cur)
    shapes.push({
      shape: cur,
      current: true,
      hash: shapeHash(cur, arrowDests, true, bounds),
    });

  const fullHash = shapes.map(sc => sc.hash).join(';');
  if (fullHash === state.drawable.prevSvgHash) return;
  state.drawable.prevSvgHash = fullHash;

  /*
    -- DOM hierarchy --
    <svg class="cg-shapes">      (<= svg)
      <defs>
        ...(for brushes)...
      </defs>
      <g>
        ...(for arrows, circles, and pieces)...
      </g>
    </svg>
    <svg class="cg-custom-svgs"> (<= customSvg)
      <g>
        ...(for custom svgs)...
      </g>
    </svg>
  */

  const defsEl = svg.querySelector('defs') as SVGElement;
  const shapesEl = svg.querySelector('g') as SVGElement;
  const customSvgsEl = customSvg.querySelector('g') as SVGElement;

  syncDefs(d, shapes, defsEl);
  syncShapes(
    state,
    shapes.filter(s => !s.shape.customSvg),
    d.brushes,
    arrowDests,
    shapesEl,
  );
  syncShapes(
    state,
    shapes.filter(s => s.shape.customSvg),
    d.brushes,
    arrowDests,
    customSvgsEl,
  );
}

// append only. Don't try to update/remove.
function syncDefs(d: Drawable, shapes: Shape[], defsEl: SVGElement) {
  const brushes: CustomBrushes = new Map();
  let brush: DrawBrush;
  for (const s of shapes) {
    if (s.shape.dest) {
      brush = d.brushes[s.shape.brush!];
      if (s.shape.modifiers) brush = makeCustomBrush(brush, s.shape.modifiers);
      brushes.set(brush.key, brush);
    }
  }
  const keysInDom = new Set();
  let el: SVGElement | undefined = defsEl.firstChild as SVGElement;
  while (el) {
    keysInDom.add(el.getAttribute('cgKey'));
    el = el.nextSibling as SVGElement | undefined;
  }
  for (const [key, brush] of brushes.entries()) {
    if (!keysInDom.has(key)) defsEl.appendChild(renderMarker(brush));
  }
}

// append and remove only. No updates.
function syncShapes(
  state: State,
  shapes: Shape[],
  brushes: DrawBrushes,
  arrowDests: ArrowDests,
  root: SVGElement,
): void {
  const bounds = state.dom.bounds(),
    hashesInDom = new Map(), // by hash
    toRemove: SVGElement[] = [];
  for (const sc of shapes) hashesInDom.set(sc.hash, false);
  let el: SVGElement | undefined = root.firstChild as SVGElement,
    elHash: Hash;
  while (el) {
    elHash = el.getAttribute('cgHash') as Hash;
    // found a shape element that's here to stay
    if (hashesInDom.has(elHash)) hashesInDom.set(elHash, true);
    // or remove it
    else toRemove.push(el);
    el = el.nextSibling as SVGElement | undefined;
  }
  // remove old shapes
  for (const el of toRemove) root.removeChild(el);
  // insert shapes that are not yet in dom
  for (const sc of shapes) {
    if (!hashesInDom.get(sc.hash)) root.appendChild(renderShape(state, sc, brushes, arrowDests, bounds));
  }
}

function shapeHash(
  { orig, dest, brush, piece, modifiers, customSvg }: DrawShape,
  arrowDests: ArrowDests,
  current: boolean,
  bounds: ClientRect,
): Hash {
  return [
    bounds.width,
    bounds.height,
    current,
    orig,
    dest,
    brush,
    dest && (arrowDests.get(dest) || 0) > 1,
    piece && pieceHash(piece),
    modifiers && modifiersHash(modifiers),
    customSvg && customSvgHash(customSvg),
  ]
    .filter(x => x)
    .join(',');
}

function pieceHash(piece: DrawShapePiece): Hash {
  return [piece.playerIndex, piece.role, piece.scale].filter(x => x).join(',');
}

function modifiersHash(m: DrawModifiers): Hash {
  return '' + (m.lineWidth || '');
}

function customSvgHash(s: string): Hash {
  // Rolling hash with base 31 (cf. https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript)
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) >>> 0;
  }
  return 'custom-' + h.toString();
}

function renderShape(
  state: State,
  { shape, current, hash }: Shape,
  brushes: DrawBrushes,
  arrowDests: ArrowDests,
  bounds: ClientRect,
): SVGElement {
  let el: SVGElement;
  if (shape.customSvg) {
    const orig = orient(state.key2pos(shape.orig), state.orientation, state.dimensions);
    el = renderCustomSvg(shape.customSvg, orig, bounds, state.dimensions);
  } else if (shape.piece)
    el = renderPiece(
      state,
      state.drawable.pieces.baseUrl,
      orient(state.key2pos(shape.orig), state.orientation, state.dimensions),
      shape.piece,
      bounds,
      state.dimensions,
      state.myPlayerIndex,
      state.variant,
    );
  else {
    const orig = orient(state.key2pos(shape.orig), state.orientation, state.dimensions);
    if (shape.orig && shape.dest) {
      let brush: DrawBrush = brushes[shape.brush!];
      if (shape.modifiers) brush = makeCustomBrush(brush, shape.modifiers);
      el = renderArrow(
        state,
        brush,
        orig,
        orient(state.key2pos(shape.dest), state.orientation, state.dimensions),
        current,
        (arrowDests.get(shape.dest) || 0) > 1,
        bounds,
        state.dimensions,
      );
    } else el = renderCircle(state, brushes[shape.brush!], orig, current, bounds, state.dimensions);
  }
  el.setAttribute('cgHash', hash);
  return el;
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

function renderCircle(
  state: State,
  brush: DrawBrush,
  pos: cg.Pos,
  current: boolean,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): SVGElement {
  const o = state.pos2px(pos, bounds, bd),
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
  state: State,
  brush: DrawBrush,
  orig: cg.Pos,
  dest: cg.Pos,
  current: boolean,
  shorten: boolean,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
): SVGElement {
  const m = arrowMargin(bounds, shorten && !current, bd),
    a = state.pos2px(orig, bounds, bd),
    b = state.pos2px(dest, bounds, bd),
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

function renderPiece(
  state: State,
  baseUrl: string,
  pos: cg.Pos,
  piece: DrawShapePiece,
  bounds: ClientRect,
  bd: cg.BoardDimensions,
  myPlayerIndex: cg.PlayerIndex,
  variant: cg.Variant,
): SVGElement {
  const o = state.pos2px(pos, bounds, bd),
    width = (bounds.width / bd.width) * (piece.scale || 1),
    height = (bounds.height / bd.height) * (piece.scale || 1),
    name = roleToSvgName(variant, piece, state.orientation);
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
}

function renderMarker(brush: DrawBrush): SVGElement {
  const marker = setAttributes(createElement('marker'), {
    id: 'arrowhead-' + brush.key,
    orient: 'auto',
    markerWidth: 4,
    markerHeight: 8,
    refX: 2.05,
    refY: 2.01,
  });
  marker.appendChild(
    setAttributes(createElement('path'), {
      d: 'M0,0 V4 L3,2 Z',
      fill: brush.color,
    }),
  );
  marker.setAttribute('cgKey', brush.key);
  return marker;
}

export function setAttributes(el: SVGElement, attrs: { [key: string]: any }): SVGElement {
  for (const key in attrs) el.setAttribute(key, attrs[key]);
  return el;
}

function orient(pos: cg.Pos, orientation: cg.Orientation, bd: cg.BoardDimensions): cg.Pos {
  return T.mapToP1Inverse[orientation](pos, bd);
}

function makeCustomBrush(base: DrawBrush, modifiers: DrawModifiers): DrawBrush {
  return {
    color: base.color,
    opacity: Math.round(base.opacity * 10) / 10,
    lineWidth: Math.round(modifiers.lineWidth || base.lineWidth),
    key: [base.key, modifiers.lineWidth].filter(x => x).join(''),
  };
}

function circleWidth(bounds: ClientRect, bd: cg.BoardDimensions): [number, number] {
  const base = bounds.width / (bd.width * 64);
  return [3 * base, 4 * base];
}

function lineWidth(brush: DrawBrush, current: boolean, bounds: ClientRect, bd: cg.BoardDimensions): number {
  return (((brush.lineWidth || 10) * (current ? 0.85 : 1)) / (bd.width * 64)) * bounds.width;
}

function opacity(brush: DrawBrush, current: boolean): number {
  return (brush.opacity || 1) * (current ? 0.9 : 1);
}

function arrowMargin(bounds: ClientRect, shorten: boolean, bd: cg.BoardDimensions): number {
  return ((shorten ? 20 : 10) / (bd.width * 64)) * bounds.width;
}

export function pos2px(pos: cg.Pos, bounds: ClientRect, bd: cg.BoardDimensions): cg.NumberPair {
  return [((pos[0] - 0.5) * bounds.width) / bd.width, ((bd.height + 0.5 - pos[1]) * bounds.height) / bd.height];
}

function roleToSvgName(variant: cg.Variant, piece: DrawShapePiece, orientation?: cg.Orientation): string {
  switch (variant) {
    case 'shogi':
    case 'minishogi': {
      const reversePiece = orientation && orientation !== piece.playerIndex;

      let role = '';
      switch (piece.role) {
        //promoted
        case 'pp-piece':
          role = 'TO';
          break;
        case 'pl-piece':
          role = 'NY';
          break;
        case 'pn-piece':
          role = 'NK';
          break;
        case 'ps-piece':
          role = 'NG';
          break;
        case 'pr-piece':
          role = 'RY';
          break;
        case 'pb-piece':
          role = 'UM';
          break;
        //not promoted
        case 'p-piece':
          role = 'FU';
          break;
        case 'l-piece':
          role = 'KY';
          break;
        case 'n-piece':
          role = 'KE';
          break;
        case 's-piece':
          role = 'GI';
          break;
        case 'r-piece':
          role = 'HI';
          break;
        case 'b-piece':
          role = 'KA';
          break;
        case 'g-piece':
          role = 'KI';
          break;
        case 'k-piece':
          role = piece.playerIndex === 'p1' ? 'GY' : 'OU';
          break;
      }
      return `${Number(reversePiece).toString()}${role}`;
    }
    case 'xiangqi':
      return (piece.playerIndex === 'p1' ? 'R' : 'B') + piece.role[0].toUpperCase();
    case 'flipello10':
    case 'flipello':
    case 'linesOfAction':
    case 'go9x9':
    case 'go13x13':
    case 'go19x19':
    case 'abalone':
      return (piece.playerIndex === 'p1' ? 'b' : 'w') + piece.role[0].toUpperCase();
    case 'oware':
    case 'togyzkumalak':
    case 'bestemshe':
      return piece.role[0].split('-')[0].substring(1);
    case 'nackgammon':
    case 'hyper':
    case 'backgammon':
      return (piece.playerIndex === 'p1' ? 'w' : 'b') + piece.role[0].split('-')[0].substring(1);
    default:
      //chess types
      return (piece.playerIndex === 'p1' ? 'w' : 'b') + piece.role[0].toUpperCase();
  }
}
