# Web-UI Codebase Guide

This document explains how this repo is organized day-to-day: the folder layout, the
component layering, the smart/view split, logging, state, styling, and testing
conventions. It's aimed at developers joining the project. Where the top-level
[README.md](../README.md) already covers something (npm scripts, the basic `src/`
overview, the high-level design considerations), this doc goes one level deeper and adds
what the README doesn't: concrete code examples, naming conventions, and the parts that
are only visible by reading the actual code.

If you're an AI agent working in this repo: this doc is the primary reference for how
code here is organized. Follow the conventions below rather than inventing new ones.

## Folder structure (`src/`)

```
src/App.jsx          root component — react-router Routes + global providers
src/index.jsx        entry point
src/theme.jsx         app theme (styled-components ThemeProvider)
src/bindings/         platform abstraction (desktop/mobile/browser implementations)
src/components/       UI components — atoms / molecules / modules (see below)
src/hooks/            reusable React hooks, grouped by concern
src/pages/            top-level, route-level pages
src/utils/            generic, side-effect-free utility functions
src/__tests__/        shared test fixtures only (testdata/*.json) — not test files
```

`src/bindings/` has one subfolder per platform capability (`fs`, `logging`,
`user-settings`, `secrets`, `devices`, `oauth`, ...), each exposing `browser.js`,
`desktop.js`, `mobile.js` variants selected by a `factory.js`. This is the web-ui side
of the `IncyclistBindings` pattern described in the workspace `CLAUDE.md` — it's how the
same UI code runs under Electron, React Native, and plain browser.

## Components: atoms / molecules / modules

`src/components/` follows atomic design, with each layer barrel-exported from its own
`index.jsx`:

- **`atoms/`** — dependency-free primitives: `Buttons/`, `Icons/`, `input/`
  (`Checkbox`, `EditText`, `EditNumber`, `SingleSelect`, ...), `layout/` (`View`,
  `Center`), `Dynamic/`, `Table/`, `Tooltip/`, `Overlay/`, `ErrorBoundary/`.
- **`molecules/`** — combine atoms, never depend on other molecules or modules:
  `Ride/`, `WorkoutGraph/`, `Settings/`, `Maps/`, `Video/`, `Activity/`, `dialogs/`,
  `NavigationBar/`.
- **`modules/`** — feature-sized components built from atoms/molecules (and sometimes
  external libs): `Ride/`, `Search/`, `Settings/`, `PairingInfo/`, `routeSelection/`,
  `workout/`, `activities/`, `shifting/`, `video/`.

Import from a layer's barrel, not by reaching into a specific file:

```js
import { Button } from '../../../atoms'
import { ElevationGraph } from '../../molecules'
```

**`pages/`** sits above the atomic hierarchy. Pages are route-level containers; they are
not atoms/molecules/modules themselves, but compose them. Several pages follow a
consistent internal split:

```
src/pages/routeList/
  page.jsx            smart container — service calls, state, handlers
  screen.jsx          presentational screen for that page
  screen.stories.jsx
  switch.jsx
  utils.js
  index.jsx           export * from './page'
```

The same `page.jsx` + `screen.jsx` + `index.jsx` pattern repeats in `pages/search/`,
`pages/routes/`, `pages/pairing/`, `pages/workouts/`. If you're adding a new page, start
from one of these as a template.

## The smart/view split

The workspace-wide rule — **don't put business logic in the UI; every bit of business
logic belongs in `incyclist-services`** — is enforced here by splitting any component
that needs service data into two pieces:

- a **smart/wrapper** component that imports hooks from `incyclist-services`, owns
  local state and handlers, and renders the view with plain props
- a **pure view** component that only imports atoms/molecules/styled-components, takes
  everything via props, and can be exercised standalone in Storybook

Existing code isn't perfectly uniform — you'll see `wrapper.jsx`/`component.jsx` pairs
and bare-name/`index.jsx` wrappers too — but **for new components, follow mobile's
naming convention**: the wrapper is `<Name>`, the pure view is `<Name>View`, e.g.
`WorkoutSettings.jsx` / `WorkoutSettingsView.jsx`. Don't introduce new
`wrapper.jsx`/`component.jsx` pairs.

The folder's barrel `index.jsx` exports **only the smart half** — the view stays
private to Storybook/tests (`export * from './wrapper'`).

Concrete examples worth reading before writing your own:

- **`src/components/modules/Settings/Workout/`** — `WorkoutSettings.jsx` calls
  `useUserSettings`, `useWorkoutList`, `useWorkoutRide`, then renders
  `WorkoutSettingsView.jsx`, which imports nothing from `incyclist-services`.
- **`src/components/modules/routeSelection/RouteDetails/`** — `wrapper.jsx` (exports
  `RouteDetailsDialog`) calls `useActivityList`, `useOnlineStatusMonitoring`,
  `useRouteList`, `useUserSettings`, owns an `EventLogger('RouteDetails')`, and renders
  `component.jsx` (exports `RouteDetails`, pure styled-components layout). Both halves
  have their own `*.unit.test.jsx`, and `component.jsx` has `stories.jsx` for Storybook.
- **`src/components/modules/Ride/views/`** — paired `index.jsx` wrappers and
  `*RideView.jsx` views per ride overlay type (`Workout/`, `Map/`, `StreetView/`,
  `Video/`).

When you add a component that needs service data: write the view first (props in,
JSX out, Storybook-able), then wrap it.

## Calling services — domain hooks today, migrating to page services

Most existing pages and smart components call `incyclist-services` **domain** hooks
directly:

```js
// src/pages/routeList/page.jsx
import { useDevicePairing, useRouteList } from 'incyclist-services'

export const RouteListPage = () => {
    const service = useRouteList()
    const pairing = useDevicePairing()
    const update = service.search(filters)
    ...
}
```

Other hooks used the same way across the codebase: `useWorkoutList`, `useActivityRide`,
`useActivityList`, `useUserSettings`, `useOnlineStatusMonitoring`, `useUnitConverter`,
`useIncyclist`.

**This is changing.** Web-ui is migrating pages onto the same page-service pattern
`mobile` already uses (`<ObjectType><Action>PageService` in `services/src/.../page/`,
see the workspace `CLAUDE.md`'s "UI Architecture: What vs How" section). The Pairing
page is the first page converted (`feat/pairing-screen-first-use-ux-wave1`, merging to
`main`). For new pages, follow its pattern rather than calling domain hooks directly:

```js
// src/pages/pairing/page.jsx
import { getDevicesPageService } from "incyclist-services"
import { usePageService } from "../../hooks/pages"

export const PairingPage = ({ mode }) => {
    const service = getDevicesPageService()
    const props = usePageService(service, [mode === 'start', location?.state?.source])

    if (!props)
        return null

    return <PairingScreen {...props} />
}
```

`usePageService` (`src/hooks/pages/usePageService.jsx`) is the generic, reusable glue:
it opens the page service on mount (`service.openPage(...openArgs)`), subscribes to its
`page-update` observer event, re-reads `getPageDisplayProperties()` on every update, and
closes the page on unmount. The page component itself only renders whatever display
props come back — the page service owns navigation, dialog visibility
(`deviceSelection`/`showInterfaceSettings`-style props), and all "what" decisions; the
page stays responsible for platform-only concerns (keyboard shortcuts, fullscreen).

The rule is case by case, not "migrate everything now":

- **New page:** always go through a page service. Don't add a new page that calls
  domain hooks directly.
- **Touching an existing page:** first check whether a `Desktop<ObjectType><Action>
  PageService` already exists for it (currently only Pairing does). If it exists, use
  it — don't add new direct domain-service calls to that page. If it doesn't exist yet,
  keep calling domain services directly; don't take on migrating that page as a side
  effect of an unrelated change.

### Page services never throw

Every public method on a page service catches its own errors, logs them, and returns a
reasonable default/fallback value instead of propagating the error. Callers in web-ui
(and mobile) can rely on page-service calls never throwing — don't wrap
`usePageService`/page-service calls in try/catch "just in case"; if you see a
page-service method that *can* throw, that's a bug in the service, not something to
guard against on the caller side.

## Logging

Logging uses `gd-eventlog`'s `EventLogger`. Convention: instantiate
`new EventLogger('<CategoryName>')` with the category set to the component/module/page
name in PascalCase, and call `logger.logEvent({...})` for anything worth recording.

```js
// src/components/modules/routeSelection/RouteDetails/wrapper.jsx
const logger = new EventLogger('RouteDetails')
logger.logEvent({ message: 'video missing', videoUrl })
```

Pages use a dedicated hook, `usePageLogger` (`src/hooks/logging/PageLogger/index.jsx`),
instead of instantiating `EventLogger` directly. It logs page open/close against a
global `'Incyclist'` category and hands back a page-scoped logger:

```js
// src/pages/routeList/page.jsx
const [logger, closePageLogger] = usePageLogger(PAGE_ID, pageState)
logger.logEvent({ message: 'item selected', title, eventSource: 'user' })
```

Rules (also stated in the README — repeating them here because they're easy to miss):

- **Log every user interaction.** If you add an interactive control, log it.
- **Never log personal data** (name, email, or anything else identifying).

### How to log a user interaction

`logEvent()` calls for a user-triggered action follow a consistent shape: a `message`
describing what happened, whatever context fields are useful, and `eventSource: 'user'`
so the event is identifiable as user-initiated rather than system-generated:

```js
// src/components/atoms/Buttons/Button/index.jsx
logger.logEvent({ message: 'button clicked', button, ...logContext, eventSource: 'user' })
```

```js
// src/pages/routeList/page.jsx
logger.logEvent({ message: 'item selected', title, eventSource: 'user' })
```

**Base input components already log themselves — don't double-log.** `Button`,
`Checkbox`, `SingleSelect`, the `EditField`-based inputs (`EditText`, `EditNumber`, ...),
`SegmentedControl`, `FlipCard`, and the link atoms (`FileLink`, `UrlLink`) all call
`logEvent(..., eventSource: 'user')` internally against the `'Incyclist'` category when
clicked/changed. If you're composing a screen out of these atoms, you get interaction
logging for free; only add your own `logEvent()` call for interactions that aren't
captured by an underlying atom (e.g. a drag, a swipe, a custom gesture, or a
higher-level "what this click meant" event you want logged in your own component's
category in addition to the atom's generic one).

Transport is platform-specific: `src/bindings/logging/` picks `ElectronLogAdpater`
(desktop), `ReactNativeLogAdpater` (mobile), or a `ConsoleAdapter` fallback (plain
browser). The desktop adapter batches events and flushes via `bulkLog()` every ~2s or
once 100 events are queued — don't expect every `logEvent()` call to hit the backend
immediately in dev.

## State management

There's no Redux/MobX/global store. **`incyclist-services` owns global state** — any
state that represents business logic belongs there, not in web-ui. Local component
state in web-ui is fine, but only for UI-only concerns (is a dialog open, which tab is
selected, a draft form value before it's submitted) — not as a substitute for state
that's actually domain data.

1. **Local component state** — plain `useState`/`useReducer` in smart components, for
   UI-only state scoped to that component/page.
2. **Global/business state** — lives in `incyclist-services` singletons, reached via
   hooks (`useRouteList()`, `useWorkoutList()`, `useUserSettings()`, ...) or, for
   pages migrated to the page-service pattern, via `getDevicesPageService()`-style
   accessors. These return a service instance that holds the real state outside React
   and exposes an observer for updates:
   ```js
   const update = service.search(filters)
   observer.on('updated', updateState)
   ```
   If you're tempted to add `useState` for something that represents actual business
   data (not "is this dialog open"), it almost certainly belongs in a
   `incyclist-services` domain service instead.
3. **React Context** — used sparingly, only for narrow page-scoped plumbing (e.g.
   `src/pages/context.jsx`'s `PageContext` carrying `pageController`/`logger` down a
   page's component tree), never as a general app-state mechanism.

Routing uses react-router's `MemoryRouter`/`Routes` (not browser history — this is an
embedded app), with per-navigation data passed via `navigate(next, { state: {...} })`.

## Styling

**styled-components**, not CSS Modules or SCSS. Plain `.css` is legacy/global-only
(`src/index.css`) or needed for a third-party widget that doesn't support
styled-components (`RouteSelectorMap.css` for Leaflet).

```js
import styled from 'styled-components'

const ContentArea = styled(Column)`
    height: calc(100% - 7.7vh);
`
```

Sizing convention: the UI was originally built for TVs, so most dimensions use `vw`/`vh`
rather than `px` — follow that convention in new components unless there's a specific
reason not to.

Theme values come from `src/theme.jsx` via the styled-components theme prop
(`props.theme?.dialogContent?.background`), provided by `AppThemeProvider` and
initialized app-wide through `useInitAppTheme()`.

## Imports

No path alias is actually in use. `vite.config.js` defines a `'@' → ./src` alias, but
nothing in `src/` uses it — all real imports are relative
(`import { Button } from '../../../atoms'`). Keep using relative imports; don't
introduce `@/...` imports without a prior decision to actually migrate.

Every folder layer has a barrel `index.jsx`/`index.js` (`export * from './X'`). Import
from the barrel of the layer above, not by reaching into a sibling's internal file.

There's no ESLint or Prettier config in this repo, and no TypeScript — this is plain
JS/JSX. Match the style of the surrounding file.

## Testing

**Vitest** + `@testing-library/react`. Tests are colocated with the source file they
test, suffixed `*.unit.test.jsx` (or `.js`), not placed in a `__tests__` folder:

```
src/pages/routeList/screen.unit.test.jsx
src/pages/routeList/utils.unit.test.js
src/components/modules/routeSelection/RouteDetails/wrapper.unit.test.jsx
src/components/modules/routeSelection/RouteDetails/component.unit.test.jsx
```

When a component has a smart/view split, test both halves separately (see the
`RouteDetails` example above — `wrapper.unit.test.jsx` and `component.unit.test.jsx`).

Storybook stories are also colocated, suffixed `*.stories.jsx`, and are the primary way
to visually exercise a **pure view** component in isolation (e.g.
`screen.stories.jsx`). Storybook itself runs as a Vitest project
(`test.projects` in `vite.config.js`), so `npm run test` can also pick up story-based
interaction tests.

`src/__tests__/testdata/*.json` holds shared fixtures (e.g. `activity.json`,
`sydney.json`) imported by unit tests across the codebase — add new shared fixtures
there rather than duplicating sample data per test file.

## Reuse existing components — don't reach for native elements

For anything user-facing, and especially for user input, **reuse the existing atoms
(`Button`, `EditText`, `EditNumber`, `Checkbox`, `SingleSelect`, ...) instead of native
HTML elements** (`<input>`, `<button>`, `<select>`) **or a new one-off local
component.** Before building a new input/control, check `src/components/atoms/` (and
`molecules/`) for something that already does it — most input patterns already exist
there. Reasons this matters, beyond just avoiding duplication:

- the existing atoms already handle styling/theming consistently with the rest of the
  app
- several of them already log user interaction for free (see Logging below) — a native
  `<input>` or a hand-rolled component won't, and you'd have to add that logging
  yourself and likely get the shape wrong
- a new local component fragments the atomic-design layering this repo relies on

If no existing atom fits, the new control belongs in `atoms/` (or `molecules/` if it
composes several atoms) so the rest of the app can reuse it too — not inlined as a
one-off inside the page/component that happens to need it first.

## Other conventions worth knowing

- **Functional components only** — no class components in new code.
- **`<ErrorBoundary>`** should wrap at least every module-level component.
- **`<Dynamic>`** (`src/components/atoms/Dynamic/`) exists for deeply-nested,
  high-frequency UI updates (e.g. live ride data) that would otherwise cause excessive
  re-renders if run through normal React state/props.
