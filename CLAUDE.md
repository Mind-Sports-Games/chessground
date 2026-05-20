# Chessground

A TypeScript abstract games UI library, forked from lichess's chessground for [playstrategy.org](https://playstrategy.org). Supports a large number of board game variants beyond chess (shogi, backgammon, go, abalone, dameo, etc.). No game logic inside — the library is purely UI; move validation is the caller's responsibility.

## Architecture

**Initialization flow:** `Chessground()` → `defaults()` → `configure()` → `renderWrap()` → `bindBoard()`

**State:** `HeadlessState` (no DOM) extended by `State` (adds DOM refs). `defaults()` in [src/state.ts](src/state.ts) defines all initial values.

**Rendering:** Custom DOM diff algorithm in [src/render.ts](src/render.ts) — minimises DOM writes. Uses `createEl()` from [src/util.ts](src/util.ts) as a factory.

**Variant HOF pattern:** Each variant in [src/variants/](src/variants/) provides its own `configure()` that wraps the base configure as a Higher Order Function. Shared by Abalone, Shogi, Backgammon, Racing Kings, etc.

**Multi-variant move dispatch:** `baseMove()` in [src/board.ts](src/board.ts) calls variant-specific update functions (`backgammonUpdatePiecesFromMove`, `calculateGoCaptures`, etc.) based on the active variant.

## Key files

| File                                     | Purpose                                                     |
| ---------------------------------------- | ----------------------------------------------------------- |
| [src/types.ts](src/types.ts)             | All types: `Variant`, `Key`, `Piece`, `Role`, `PlayerIndex` |
| [src/state.ts](src/state.ts)             | `HeadlessState` / `State` interfaces + `defaults()`         |
| [src/config.ts](src/config.ts)           | `configure()` — top-level config dispatch                   |
| [src/board.ts](src/board.ts)             | `baseMove()`, `baseUserMove()`, board logic                 |
| [src/render.ts](src/render.ts)           | DOM diff rendering, `addSquare()`                           |
| [src/api.ts](src/api.ts)                 | Public API surface                                          |
| [src/util.ts](src/util.ts)               | `createEl()`, `callUserFunction()`, shared utilities        |
| [src/chessground.ts](src/chessground.ts) | Entry point, `Chessground()`                                |
| [src/variants/](src/variants/)           | Per-variant: board.ts, config.ts, premove.ts, util.ts       |

Abalone is the most complex variant — it also has `engine.ts` (move impact computation) and its own `render.ts`.

## Key concepts

- `PlayerIndex` (p1/p2) replaces lichess's `Color` (white/black) — used throughout for multi-player support.
- `Key = 'a0' | '${File}${Rank}'` — files up to `s`, ranks up to `19` for large boards like Go 19×19.
- FEN format varies by variant: comma-separated for mancala variants, different structure for shogi/go.
- `callUserFunction()` is the callback bridge to consumers (20 edges in the graph — touches everything).

## Build commands

```bash
pnpm compile          # TypeScript compile to dist/
pnpm dist             # compile + minified bundle
pnpm run test         # Jest tests (*.test.ts alongside source)
pnpm run lint         # ESLint
pnpm run format       # Prettier
```

### Linking to another project (e.g. lila)

1. Set `LINKED_PROJECT_PATH` in `.env.local` (copy from `.env.local.default`)
2. `pnpm run link` — link package into the other project's node_modules
3. `pnpm run local-dist` — compile + write bundle directly into linked project

After `local-dist`, the consuming project may need a build restart (it doesn't watch the minified file).

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:

- ALWAYS read graphify-out/GRAPH_REPORT.md before reading any source files, running grep/glob searches, or answering codebase questions. The graph is your primary map of the codebase.
- IF graphify-out/wiki/index.md EXISTS, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
