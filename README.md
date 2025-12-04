# Tasks Board

Kanban-style board with React, Vite, TypeScript, TailwindCSS, shadcn/ui, and DnD Kit. The app keeps a clean separation between domain logic, UI, and infrastructure while persisting state to `localStorage`.

## Architecture

- **Domain-first**: Pure functions live in `src/domain` (models, `createBoard`, `addTask`, `moveTask`, `validators`). Business rules (adjacent moves only, DOING cap = 2, DONE is terminal) are enforced here and unit-tested.
- **Context as façade**: `BoardContext` wraps domain functions and repository calls. UI consumes it through `useBoard`, keeping components free of business details.
- **Infrastructure**: `BoardRepository` handles `localStorage` persistence and schema validation.
- **UI**: Presentational components in `src/components` (board/columns/cards and dialogs) use shadcn-styled primitives. DnD Kit drives drag/drop; moving into DONE triggers a confirmation dialog.
- **Separation trade-offs**: Domain remains framework-agnostic and testable; UI stays lean; repository swap is isolated.

## Why this stack

- **React + Vite (not Next.js)**: Fast dev server and simple SPA footprint; routing/SSR not needed here, so Vite keeps the stack lighter.
- **shadcn/ui**: Provides consistent, accessible primitives (Card, Button, AlertDialog) without a heavy design system.
- **DnD Kit**: Small, composable drag-and-drop with sortable contexts that map cleanly to column/card structure.
- **React Context over Redux**: Single-board scope with modest state; Context keeps dependencies minimal while still centralizing mutations behind domain functions.

## Domain rules

- Cards move only to adjacent columns (BACKLOG → TODO → DOING → DONE).
- DOING holds at most two cards.
- DONE is terminal; cards cannot leave DONE.
- Validation guards storage loads to avoid corrupt state.

## Testing strategy

- **Unit** (`src/tests/domain`): High-coverage tests for `moveTask`, repository load/save, error paths, and limits.
- **Component** (`src/tests/components`): RTL + Vitest with jsdom; adding cards, drag flows, DONE confirmation, cancel/confirm behaviors, and `localStorage` persistence (mocked).
- **Integration hooks**: BoardProvider exposes a small test API to drive state in jsdom while still emitting pointer events to mirror drag interactions.

## Project structure

```
src/
  app/
  components/ (board, dialogs, ui)
  context/
  hooks/
  domain/
    models/
    services/
    validators.ts
  infra/storage/
  tests/ (domain, components, integration)
```

## Running the project

```bash
npm install
npm run dev
npm test
```

## Possible improvements

- Add optimistic UI to show transient drag state before confirmation.
- Surface toasts for domain errors (limits, invalid moves).
- Support multiple boards and routing.
- Make column/card styling themable and add keyboard shortcuts for moves.
