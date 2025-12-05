# Task Board

A Kanban-style board application built with React+Vite, TypeScript, Tailwind, Shadcn and DndKit.

[Preview live here 👀🤞](https://drag-and-drop-trello-react.vercel.app/ "Deployed on Vercel")

Hopefully this project demonstrates clean architecture principles, comprehensive testing strategies, and effective separation of concerns.

## 📋 Requirements

Build a Board with 4 columns: **BACKLOG** → **TODO** → **DOING** → **DONE**

**Constraints:**

- ✅ Cards can only be moved by one column in any direction (adjacent moves only)
- ✅ Maximum of two cards in DOING at any time
- ✅ Once in DONE, cards cannot go back (terminal state)
- ✅ Moving cards to DONE triggers a confirmation dialog
- ✅ All actions validated client-side
- ✅ Board state persisted in Local Storage

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run tests with coverage
npm test -- --coverage
```

The app will be available at `http://localhost:5173`

## 🏗️ Architecture & Design Decisions

### 📁 Project Structure

```
src/
├── app/
│   └── App.tsx                    # Root component
├── components/
│   ├── board/                     # Board UI components
│   │   ├── Board.tsx              # DnD coordinator
│   │   ├── Column.tsx             # Droppable container
│   │   ├── Task.tsx               # Draggable card
│   │   └── AddTaskForm.tsx        # Task creation
│   ├── dialogs/
│   │   └── ConfirmDoneDialog.tsx  # DONE confirmation
│   └── ui/                        # shadcn primitives
├── contexts/
│   └── BoardContext.tsx           # State + methods
├── hooks/
│   └── useBoard.ts                # Context consumer hook
├── lib/
│   ├── services/                  # Business logic
│   │   ├── addTask.ts
│   │   ├── moveTask.ts
│   │   └── createBoard.ts
│   ├── types/                     # TypeScript types
│   └── validators.ts              # Validation logic
├── infra/
│   └── storage/
│       └── BoardRepository.ts     # Storage abstraction
└── tests/                         # All tests organized by type
```

### Core Principles

This implementation prioritizes:

- **Separation of Concerns**: Business logic, UI, and infrastructure are cleanly separated
- **Testability**: Pure functions with explicit parameters for the "business logic" -> enable thorough unit testing
- **KISS & DRY**: Simple, maintainable code without over-engineering. State and state management centralised in the Context, any component can subscribe to it.

### Architecture Layers

#### 1. **Business Logic Layer** (`src/lib/services/`)

Pure TypeScript functions that encapsulate all business rules:

- `addTask.ts` - Validates and adds new tasks to columns
- `moveTask.ts` - Enforces movement rules (adjacent columns, DOING limit, DONE terminal)
- `validators.ts` - Client-side validation before persisting board

**Why separate?** These are framework-agnostic, making them:

- Easy to unit test without React dependencies
- Reusable across different UI implementations
- Simple to reason about and modify

#### 2. **State Management** (`src/contexts/BoardContext.tsx`)

React Context provides:

- Global board state
- Methods provided to alter state (`addTask`, `moveTask`)
- Automatic persistence after each operation

**Trade-off:** Context is optimistic (updates state before persistence completes). I'm aware that if `localStorage.setItem` fails, state becomes inconsistent. For production-level with REST APIs, this would need rollback logic or perhaps React Query mutations.

#### 3. **Infrastructure Layer** (`src/infra/storage/`)

`BoardRepository` abstracts storage concerns:

- Currently uses `localStorage`
- Could be swapped for IndexedDB, REST API, or any other backend
- Validates schema on load to prevent corrupt state

**Benefit:** UI and business logic remain unchanged if we swap storage mechanisms.

#### 4. **UI Components** (`src/components/`)

Presentational components with clear responsibilities:

- `Board.tsx` - Manages DnD drag handlers and coordinates column interactions
- `Column.tsx` - Droppable container for tasks
- `Task.tsx` - Draggable/sortable task cards
- `AddTaskForm.tsx` - Form for creating new tasks
- `ConfirmDoneDialog.tsx` - Confirmation before moving to DONE

**Tech choices:**

- **DnD Kit**: Lightweight, accessible drag-and-drop library with excellent TypeScript support
- **shadcn/ui**: Unstyled, accessible UI primitives (no heavy design system overhead)
- **TailwindCSS**: Utility-first styling for rapid development

## 🧪 Testing Strategy

Following the **Testing Pyramid** principle: many unit tests, some integration tests, few E2E tests.

### Unit Tests (Base of Pyramid)

**Location:** `src/tests/lib/`

High coverage of business logic:

- `addTask.test.ts` (191 lines) - Validates task creation, column limits, edge cases
- `moveTask.test.ts` (105 lines) - Tests all movement rules, boundary conditions
- `validators.test.ts` (273 lines) - Exhaustive validation testing

**Benefits:**

- Fast execution
- Isolated testing of business rules
- Easy to debug failures
- Framework-agnostic

### Component Tests (Middle of Pyramid)

**Location:** `src/tests/components/`

React Testing Library + Vitest tests:

- `Board.test.tsx` (82 lines) - User interactions, state updates, persistence (but I was not able to find a good way of simulating the drag and drop at the moment)

**Coverage:**

- Adding tasks through the UI
- `localStorage` integration (mocked)
- Dialog interactions
- Error states and user feedback

### Integration/E2E Tests (Top of Pyramid)

**Note:** Drag-and-drop testing presents unique challenges with jsdom (doesn't fully support pointer events). For production, I'd recommend:

- **Playwright** or **Cypress** for true E2E drag-and-drop testing
- Test complete user workflows in a real browser environment

**Current limitation:** While the app works perfectly in browsers, comprehensive D&D test automation would require additional tooling investment.

## ✨ Implementation Highlights

### Business Rule Enforcement

All constraints are validated in pure functions before state updates:

```typescript
// Example: moveTask enforces all business rules
export function moveTask(board: Board, taskId: string, toColumnId: string) {
  // Validates: adjacent moves, DOING limit, DONE terminal state
  // Returns: Either success or descriptive error
}
```

### Type Safety

Full TypeScript coverage ensures:

- Compile-time error detection
- IDE autocomplete and refactoring support
- Self-documenting code through interfaces

### Accessible UI

- Keyboard navigation support
- Screen reader friendly
- ARIA attributes on interactive elements
- Focus management in dialogs

## 🔄 Known Trade-offs & Future Improvements

### Current Trade-offs

1. **Optimistic UI**: State updates before persistence. Would benefit from:

   - Rollback on failure
   - Maybe an dedicated library for mutation management, with rollback included (React Query?)
   - Optimistic updates with error boundaries

2. **Responsive Design**: Optimized for desktop (similar to Trello's approach)

   - Mobile support would require layout adjustments

3. **Task Ordering**: Tasks within columns maintain creation order
   - Full sortable reordering would require additional DnD logic

### Future Enhancements

- **Reset/Delete Operations**: Add `resetBoard()` and `deleteTask()` functions
- **Better Error UX**: Toast notifications for validation errors, ErrorBoundary
- **Context Optimization**: Consider splitting state/dispatch contexts (React's reducer pattern)
- **Multi-board Support**: Add routing and board selection
- **Undo/Redo**: Command pattern for operation history
- **Drag Preview**: Visual feedback during drag operations

## 🛠️ Technology Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Accessible UI components
- **DnD Kit** - Drag and drop functionality
- **Vitest** - Test runner
- **React Testing Library** - Component testing

## 📝 Notes on Design Philosophy

This implementation favors:

- **Explicit over implicit**: Clear function signatures and return types
- **Pure functions over side effects**: Business logic has no side effects
- **Composition over inheritance**: Small, focused functions
- **Testability over convenience**: Architecture supports easy testing (except the Drag and Drop)
- **Type safety over runtime checks**: TypeScript prevents entire classes of bugs
