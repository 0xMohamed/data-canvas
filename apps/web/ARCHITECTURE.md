# Architecture Overview

## Editor Layering

The slide editor is organized in three clear layers to separate concerns and enable modular reasoning:

### 1. Model Layer (`features/editor/model/`)
- **Purpose**: Pure data types, utilities, and defaults. No React hooks or side effects.
- **Examples**:
  - `types.ts` – Core types (`Deck`, `Slide`, `Block`, `BlockContent`, etc.)
  - `layout.ts` – Grid layout math, collision resolution, normalization helpers
  - `blockDefaults.ts` – Default block content factory (`makeDefaultContent`)
- **Invariant**: No React, no async, no side effects.

### 2. Hooks Layer (`features/editor/hooks/`)
- **Purpose**: Encapsulate stateful logic and controllers. No UI.
- **Examples**:
  - `useDeckState` – Deck/slide/block CRUD and navigation state
  - `useResizeController` – Resize session logic (preview/apply/end)
  - `useDndController` – Drag-and-drop session, sensors, overlay, placement logic
- **Invariant**: Accepts model types and callbacks; returns state/handlers. No JSX.

### 3. Components Layer (`features/editor/components/`)
- **Purpose**: Presentational UI and orchestration. Delegates behavior to hooks.
- **Examples**:
  - `SlideEditor` – Orchestrator, wires hooks and renders layout
  - `SlideCanvas` – DndContext wrapper, grid, drag overlay
  - `SlidesSidebar`, `SlideToolbar`, `DraggableBlock`, etc.
- **Invariant**: Uses hooks for state/actions; renders UI; no heavy business logic.

### Data Flow
```
Model (types/utils) → Hooks (state/controllers) → Components (UI)
```
- Hooks read/write model types.
- Components consume hooks and render UI.
- No cross-layer cycles.

## Auth Refresh Flow

We use a centralized Axios instance with a refresh-once retry strategy:

### Files
- `lib/api/axios.ts` – Centralized `api` instance with request/response interceptors.
- `features/auth/api.ts` – Auth API calls using the centralized instance.
- `features/auth/hooks.ts` – React Query hooks wrapping auth API.

### Flow
1. **Request interceptor**: Attach `Authorization: Bearer <token>` if a token exists.
2. **Response interceptor**:
   - On `401` and not already retried (`_retry` flag):
     - If another refresh is in progress, queue the request.
     - Otherwise, start refresh (`POST /auth/refresh`).
     - On success, store the new access token, resolve queued requests with the token, and retry the original request.
     - On failure, clear tokens and reject queued requests.
   - If already retried, fail fast to avoid loops.

### Guarantees
- **Single refresh per concurrent 401 burst** via `isRefreshing` flag.
- **Queue** ensures all waiting requests get the same new token.
- **No duplicate refresh** via `_retry` flag.

## Public Mode & Navigation

- Public mode disables editing controls and enables keyboard navigation (←/→) between slides.
- Navigation state is managed in `useDeckState`; `SlideEditor` binds keydown listeners only in public mode.

## Styling & Theming

- Tailwind CSS for utilities.
- CSS custom properties (`--theme-*`) for dynamic theme switching.
- `ThemeSwitcher` toggles between light/dark by updating CSS variables on the root.

## Type Safety

- OpenAPI-generated schema in `api/schema.ts` provides exact API payload types.
- All API modules (`features/*/api.ts`) use these schema types.
- No `any` casts; safe narrowing used where runtime checks are required.
