# Graph Report - .  (2026-05-20)

## Corpus Check
- Corpus is ~37,823 words - fits in a single context window. You may not need a graph.

## Summary
- 735 nodes · 1682 edges · 70 communities (31 shown, 39 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 14 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Core Board & Variant Dispatch|Core Board & Variant Dispatch]]
- [[_COMMUNITY_Piece Mobility & Premoves|Piece Mobility & Premoves]]
- [[_COMMUNITY_Rendering & DOM Layout|Rendering & DOM Layout]]
- [[_COMMUNITY_API & Configuration|API & Configuration]]
- [[_COMMUNITY_Drawing & Annotations|Drawing & Annotations]]
- [[_COMMUNITY_Core Types & Variant Registries|Core Types & Variant Registries]]
- [[_COMMUNITY_Board Geometry & Scoring|Board Geometry & Scoring]]
- [[_COMMUNITY_Drop Mode & Event Handling|Drop Mode & Event Handling]]
- [[_COMMUNITY_Go & Board Area Calculation|Go & Board Area Calculation]]
- [[_COMMUNITY_Backgammon & Constants|Backgammon & Constants]]
- [[_COMMUNITY_FEN Parsing & Serialization|FEN Parsing & Serialization]]
- [[_COMMUNITY_Board Logic & Move Validation|Board Logic & Move Validation]]
- [[_COMMUNITY_Drop & Premove Execution|Drop & Premove Execution]]
- [[_COMMUNITY_Animation Pipeline|Animation Pipeline]]
- [[_COMMUNITY_Multi-Variant Move Updates|Multi-Variant Move Updates]]
- [[_COMMUNITY_Square Selection & Dice|Square Selection & Dice]]
- [[_COMMUNITY_Main Init & Document Events|Main Init & Document Events]]
- [[_COMMUNITY_State & Interface Definitions|State & Interface Definitions]]
- [[_COMMUNITY_SVG Arrows & Position Mapping|SVG Arrows & Position Mapping]]
- [[_COMMUNITY_Move Permission & Premove Play|Move Permission & Premove Play]]
- [[_COMMUNITY_DOM Utilities & Orientation|DOM Utilities & Orientation]]
- [[_COMMUNITY_Go Territory Scoring|Go Territory Scoring]]
- [[_COMMUNITY_Config & Test Setup|Config & Test Setup]]
- [[_COMMUNITY_Key Coordinate System|Key Coordinate System]]
- [[_COMMUNITY_Drag & Draw Processing|Drag & Draw Processing]]
- [[_COMMUNITY_Position Translation|Position Translation]]
- [[_COMMUNITY_Drop Mode Control|Drop Mode Control]]
- [[_COMMUNITY_Drop Actions|Drop Actions]]
- [[_COMMUNITY_Player Index|Player Index]]
- [[_COMMUNITY_Piece Type|Piece Type]]
- [[_COMMUNITY_Key Type|Key Type]]
- [[_COMMUNITY_Pos Type|Pos Type]]
- [[_COMMUNITY_DOM Elements|DOM Elements]]
- [[_COMMUNITY_Destinations Type|Destinations Type]]
- [[_COMMUNITY_Drop Destinations|Drop Destinations]]
- [[_COMMUNITY_Piece DOM Node|Piece DOM Node]]
- [[_COMMUNITY_Square DOM Node|Square DOM Node]]
- [[_COMMUNITY_Explosion State|Explosion State]]
- [[_COMMUNITY_Move Metadata|Move Metadata]]
- [[_COMMUNITY_Notation Enum|Notation Enum]]
- [[_COMMUNITY_Coordinates Enum|Coordinates Enum]]
- [[_COMMUNITY_Doubling Cube|Doubling Cube]]
- [[_COMMUNITY_Dice Interface|Dice Interface]]
- [[_COMMUNITY_Multi-Point State|Multi-Point State]]
- [[_COMMUNITY_Chess Variants List|Chess Variants List]]
- [[_COMMUNITY_Shogi Variants List|Shogi Variants List]]
- [[_COMMUNITY_Xiangqi Variants List|Xiangqi Variants List]]
- [[_COMMUNITY_Go Variants List|Go Variants List]]
- [[_COMMUNITY_Abalone Variants List|Abalone Variants List]]
- [[_COMMUNITY_Initial FEN Constant|Initial FEN Constant]]
- [[_COMMUNITY_Config Interface|Config Interface]]
- [[_COMMUNITY_Draw Shape|Draw Shape]]
- [[_COMMUNITY_Draw Brush|Draw Brush]]
- [[_COMMUNITY_Public API Interface|Public API Interface]]
- [[_COMMUNITY_Mobility Type|Mobility Type]]
- [[_COMMUNITY_DOM Pos Tests|DOM Pos Tests]]
- [[_COMMUNITY_Snapped Pos Tests|Snapped Pos Tests]]
- [[_COMMUNITY_Backgammon Pos Tests|Backgammon Pos Tests]]
- [[_COMMUNITY_FEN Read Tests|FEN Read Tests]]
- [[_COMMUNITY_FEN Write Tests|FEN Write Tests]]
- [[_COMMUNITY_FEN Pocket Tests|FEN Pocket Tests]]
- [[_COMMUNITY_Shogi Unpromoted Role|Shogi Unpromoted Role]]
- [[_COMMUNITY_Shogi Promoted Role|Shogi Promoted Role]]

## God Nodes (most connected - your core abstractions)
1. `premove()` - 33 edges
2. `callUserFunction()` - 20 edges
3. `renderWrap()` - 18 edges
4. `createEl()` - 18 edges
5. `computeMoveImpact()` - 18 edges
6. `diff()` - 16 edges
7. `configure()` - 16 edges
8. `validDestinations()` - 16 edges
9. `computeMoveVectorPostMove()` - 16 edges
10. `State` - 15 edges

## Surprising Connections (you probably didn't know these)
- `configure()` --implements--> `Higher Order Functions variant override pattern (Abalone design rationale)`  [INFERRED]
  variants/abalone/config.ts → src/variants/abalone/README.md
- `render()` --calls--> `createEl()`  [EXTRACTED]
  render.ts → util.ts
- `computeSquareClasses()` --calls--> `calculatePlayerEmptyAreas()`  [EXTRACTED]
  render.ts → util.ts
- `configure()` --calls--> `setSelected()`  [EXTRACTED]
  config.ts → board.ts
- `dragNewPiece()` --calls--> `predrop()`  [EXTRACTED]
  drag.ts → predrop.ts

## Hyperedges (group relationships)
- **Piece Move Lifecycle** — events_startdragordraw, drag_end, board_usermove, board_basemove, anim_anim [INFERRED 0.85]
- **Variant-Specific Piece Update Flow** — board_basemove, util_owareupdatepieces, util_togyzkumalakupdatepieces, util_backgammonupdatepieces, util_dameoupdatepieces [EXTRACTED 1.00]
- **Board Initialization Flow** — chessground_chessground, state_defaults, config_configure, wrap_renderwrap, events_bindboard [EXTRACTED 1.00]
- **Abalone Move Pipeline: engine computes impact, board applies it, render reflects result** — abalone_engine_computemoveimpact, abalone_board_basemove, abalone_render_render, abalone_types_moveimpact [INFERRED 0.85]
- **Variant HOF configure pattern used by Abalone, Shogi, Backgammon, Racing Kings** — abalone_config_configure, shogi_config_configure, backgammon_config_configure, racingkings_config_configure, abalone_readme_hof_pattern [INFERRED 0.90]
- **Abalone premove uses geometry utilities to validate in-line and broadside moves** — abalone_premove_validdestinations, abalone_util_geometry, abalone_util_isusable, abalone_premove_canjumpto [EXTRACTED 0.90]

## Communities (70 total, 39 thin omitted)

### Community 0 - "Core Board & Variant Dispatch"
Cohesion: 0.06
Nodes (98): baseMove(), getKeyAtDomPos(), getSnappedKeyAtDomPos(), configure(), pos2pxBridge(), premoveBridge(), DiagonalDirectionString, getDirectionString() (+90 more)

### Community 1 - "Piece Mobility & Premoves"
Cohesion: 0.07
Nodes (60): amazon(), amazonsQueen(), archbishop(), bishop(), breakthroughtroykaPawn(), centaur(), chancellor(), dameoMan() (+52 more)

### Community 2 - "Rendering & DOM Layout"
Cohesion: 0.07
Nodes (54): addSquare(), computeSquareClasses(), pieceNameOf (Abalone), pieceNameOf(), render(), translateAbs(), translateRel(), anim() (+46 more)

### Community 3 - "API & Configuration"
Cohesion: 0.07
Nodes (36): configure(), circleRadius(), circleWidth(), pos2px(), stackCount(), configure(), configure(), roleToSvgName() (+28 more)

### Community 4 - "Drawing & Annotations"
Cohesion: 0.08
Nodes (47): addShape(), brushes, cancel(), clear(), Drawable, DrawBrush, DrawBrushes, DrawCurrent (+39 more)

### Community 5 - "Core Types & Variant Registries"
Cohesion: 0.05
Nodes (38): abaloneVariants, BackgammonScores, Button, chessVariants, CubeAction, Dests, Dom, Drop (+30 more)

### Community 6 - "Board Geometry & Scoring"
Cohesion: 0.08
Nodes (27): adjacentKeys(), backgammonPosDiff(), boardIndexFromUci(), calculateBackgammonScores(), calculateFlippingPieces(), Callback, computeSquareCenter(), createMancalaBoardArrayFromPieces() (+19 more)

### Community 7 - "Drop Mode & Event Handling"
Cohesion: 0.1
Nodes (24): areMyDiceAtDomPos(), isAutoRollButtonAtDomPos(), isButtonAtPos(), isDoubleButtonAtDomPos(), isDropButtonAtDomPos(), isRollButtonAtDomPos(), isTakeButtonAtDomPos(), isUndoButtonAtDomPos() (+16 more)

### Community 8 - "Go & Board Area Calculation"
Cohesion: 0.08
Nodes (28): allKeys(), calculateAreas(), calculateBorder(), calculateGoScores(), calculatePlayerEmptyAreas(), files(), adjacent, areas (+20 more)

### Community 9 - "Backgammon & Constants"
Cohesion: 0.14
Nodes (27): Dice, DoublingCube, Elements, files, goVariants, letters, Notation, orientations (+19 more)

### Community 10 - "FEN Parsing & Serialization"
Cohesion: 0.11
Nodes (21): read(), write(), getCellList(), read(), commaFenVariants, mancalaFenVariants, read(), readPocket() (+13 more)

### Community 11 - "Board Logic & Move Validation"
Cohesion: 0.19
Nodes (17): baseMove(), baseUserMove(), getSnappedKeyAtDomPos(), isCapture(), setDropVariantState(), setOrientation(), setPieces(), toggleOrientation() (+9 more)

### Community 12 - "Drop & Premove Execution"
Cohesion: 0.23
Nodes (19): baseLift(), baseNewPiece(), buttonPressed(), cancelDropMode(), cancelMove(), canDrop(), dropNewPiece(), playPredrop() (+11 more)

### Community 13 - "Animation Pipeline"
Cohesion: 0.16
Nodes (6): anim(), animate(), anim render(), step(), api start(), dragNewPiece()

### Community 14 - "Multi-Variant Move Updates"
Cohesion: 0.16
Nodes (10): baseMove(), baseNewPiece(), Multi-Variant Move Calculation Pattern, setDropVariantState(), backgammonUpdatePiecesFromMove(), calculateBackgammonDropChanges(), calculateGoCaptures(), callUserFunction() (+2 more)

### Community 15 - "Square Selection & Dice"
Cohesion: 0.19
Nodes (9): canMove(), selectSquare(), setSelected(), unselect(), userMove(), drag.end(), drag.start(), bindBoard() (+1 more)

### Community 16 - "Main Init & Document Events"
Cohesion: 0.17
Nodes (6): Chessground(), draw.end(), bindDocument(), Chessground Module Export, calculateBackgammonScores(), renderWrap()

### Community 17 - "State & Interface Definitions"
Cohesion: 0.18
Nodes (11): AnimCurrent Interface, DragCurrent Interface, Drawable Interface, State Function Delegation Pattern, HeadlessState Interface, State Interface, BoardDimensions Interface, Dom Interface (+3 more)

### Community 18 - "SVG Arrows & Position Mapping"
Cohesion: 0.22
Nodes (10): getSnappedKeyAtDomPos(), knight mobility, queen mobility, pos2px(), renderArrow(), renderCircle(), renderPiece() SVG, renderSvg() (+2 more)

### Community 19 - "Move Permission & Premove Play"
Cohesion: 0.24
Nodes (10): canMove(), canPredrop(), canPremove(), isMovable(), isPremovable(), playPremove(), selectSquare(), setSelected() (+2 more)

### Community 20 - "DOM Utilities & Orientation"
Cohesion: 0.2
Nodes (5): getKeyAtDomPos(), DOM Element Reuse Pattern, posZIndex(), render(), mapToP1 Transformations

### Community 21 - "Go Territory Scoring"
Cohesion: 0.39
Nodes (8): setGoScore(), computeSquareClasses(), adjacentKeys(), calculateAreas(), calculateGoScores(), calculatePieceGroup(), calculatePlayerEmptyAreas(), util Functions Tests

### Community 22 - "Config & Test Setup"
Cohesion: 0.38
Nodes (5): configure(), FEN read(), FEN readPocket(), premove() Tests, defaults()

### Community 23 - "Key Coordinate System"
Cohesion: 0.53
Nodes (6): FEN write(), predrop(), premove(), allKeys(), key2pos(), pos2key()

## Knowledge Gaps
- **157 isolated node(s):** `commaFenVariants`, `mancalaFenVariants`, `Letter`, `StoneCount`, `File` (+152 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **39 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `api start()` connect `Animation Pipeline` to `Multi-Variant Move Updates`, `Square Selection & Dice`, `Main Init & Document Events`, `Config & Test Setup`, `Key Coordinate System`?**
  _High betweenness centrality (0.010) - this node is a cross-community bridge._
- **Why does `premove()` connect `Piece Mobility & Premoves` to `API & Configuration`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **Why does `createEl()` connect `Backgammon & Constants` to `Rendering & DOM Layout`, `Board Geometry & Scoring`?**
  _High betweenness centrality (0.007) - this node is a cross-community bridge._
- **What connects `commaFenVariants`, `mancalaFenVariants`, `Letter` to the rest of the system?**
  _157 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Core Board & Variant Dispatch` be split into smaller, more focused modules?**
  _Cohesion score 0.06 - nodes in this community are weakly interconnected._
- **Should `Piece Mobility & Premoves` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._
- **Should `Rendering & DOM Layout` be split into smaller, more focused modules?**
  _Cohesion score 0.07 - nodes in this community are weakly interconnected._