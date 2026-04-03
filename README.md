# Markdown Alchemist

A browser-based, distraction-free Markdown editor built with Next.js 14 App Router.

---

## Features

- **Split-screen editor** — write Markdown on the left, see the rendered preview on the right in real time
- **Syntax highlighting** — fenced code blocks are highlighted via `react-syntax-highlighter` (Prism engine); theme inverts relative to the app theme (light app → dark code, dark app → light code)
- **Auto-save** — changes are saved to in-memory state instantly with a visual Saving → Saved badge
- **Download** — export the raw Markdown as a `.md` file
- **Export PDF** — print the rendered document via the browser print dialog, always in light-mode regardless of the active theme
- **Preview toggle** — hide the preview pane to go full-width editor
- **Synchronized scrolling** — the preview pane follows the editor scroll position (toggleable in Settings)
- **Dark mode** — class-based Tailwind dark mode with an explicit toggle in Settings
- **i18n** — UI language switchable between English and Simplified Chinese
- **Read-only preview route** — `/preview/[id]` for a clean, full-screen reading view

---

## Tech Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v3 (`darkMode: 'class'`) |
| Markdown rendering | `react-markdown` + `remark-gfm` |
| Syntax highlighting | `react-syntax-highlighter` (Prism, `oneDark` / `oneLight`) |
| Icons | Lucide React |
| State | Client-side React Context (in-memory, no database) |

---

## Routes

| Path | Description |
|---|---|
| `/` | Dashboard — list, create, and delete documents |
| `/edit/[id]` | Split-screen editor |
| `/preview/[id]` | Full-screen read-only preview |
| `/settings` | Theme, language, and editor preferences |

---

## Data Model

```ts
interface Document {
  id: string        // UUID
  title: string
  content: string   // raw Markdown
  updatedAt: number // Unix timestamp (ms)
}
```

All documents are stored in-memory via React Context for the duration of the session.

---

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Design Iterations

The project was built in six incremental iterations. Each one added a focused set of features on top of a stable base.

### Iteration 1 — Project Scaffold & Core Editor

Bootstrapped the Next.js application and implemented the primary feature: the split-screen Markdown editor at `/edit/[id]`.

Key decisions:
- **App Router + Server/Client boundary** — route files are thin Server Components; interactivity is pushed down to `"use client"` leaf components.
- **React Context only** — no database, no `localStorage`. All documents live in memory for the session.
- **CSS Grid toolbar** — `grid-cols-3` ensures the title input is always geometrically centered regardless of how many buttons are on either side.
- **Auto-save cosmetic delay** — changes hit the store instantly; a 600 ms timeout flips the badge from "Saving…" to "Saved" as user feedback.
- **Preview always in DOM** — the preview pane is never conditionally removed; it is hidden via CSS (`hidden` class). This decision enabled the PDF export in Iteration 5.

### Iteration 2 — Settings: Dark Mode & i18n

Turned the settings stub into a functional page with theme and language controls.

Key decisions:
- **Separate `SettingsContext`** — theme and language are global UI concerns unrelated to documents; a dedicated context respects single responsibility.
- **Class-based dark mode** — `darkMode: 'class'` gives the user explicit control rather than silently following the OS preference.
- **Typed `Translations` interface** — `lib/i18n.ts` defines every UI string as a named key with `string` types; both `en` and `zh` objects must satisfy the interface, so TypeScript catches missing keys at compile time.

### Iteration 3 — Syntax Highlighting & Code Showcase Document

Added per-language code block highlighting across the editor preview and the standalone preview route.

Key decisions:
- **Shared `useMdComponents` hook** — both the editor and `/preview/[id]` use the same hook so highlighting behaviour has a single source of truth.
- **Prism over highlight.js** — broader language coverage and cleaner token granularity.
- **`useMemo([theme])`** — memoizing the components object on `theme` prevents `react-markdown` from unmounting and remounting all rendered nodes on every keystroke.
- **`REMARK_PLUGINS` as a module-level constant** — prevents a new array being allocated on each render, which would cause `react-markdown` to re-parse unnecessarily.

### Iteration 4 — Synchronized Scrolling

When the user scrolls the editor textarea, the preview pane scrolls to the same relative position. Controllable via a toggle in Settings (on by default).

Key decisions:
- **Scroll-ratio approach** — `scrollTop / (scrollHeight - clientHeight)` expresses position as a ratio and applies it to the preview's own scrollable range, correcting for the different content heights of raw Markdown vs. rendered HTML.
- **One-directional sync** — editor → preview only; bidirectional sync would create feedback loops.
- **No loop guard needed** — setting `element.scrollTop` directly in JavaScript does not fire a `scroll` event in modern browsers.

### Iteration 5 — Download & Export PDF

Let users download the raw Markdown as a `.md` file and export the rendered document as a PDF.

Key decisions:
- **PDF via `window.print()`** — zero dependencies, crisp vector text, proper pagination. The tradeoff (one extra browser dialog click) is acceptable compared to `html2canvas`/`jsPDF` (+300 KB bundle, rasterised text) or `@react-pdf/renderer` (requires mapping Markdown AST to react-pdf components).
- **Print layout via Tailwind `print:` variants** — toolbar and textarea get `print:hidden`; preview pane gets `print:!block print:!w-full` (the `!` overrides `hidden`'s `display: none !important`).
- **Download via Blob + object URL** — `new Blob → createObjectURL → synthetic <a download> click → revokeObjectURL`. No libraries, no server round-trip.

### Iteration 6 — Code Block Theme Inversion & Print Light-Mode Fix

Inverted the code block theme for visual contrast, and ensured PDF export always produces light-mode output.

Key decisions:
- **Theme inversion** — light app → `oneDark` (dark code block), dark app → `oneLight` (light code block).
- **`forceLightMode` parameter on `useMdComponents`** — `@media print` CSS cannot override inline `style` attributes written by `react-syntax-highlighter`. A React-level parameter is required; when `true` it always picks `oneDark`.
- **`flushSync` for synchronous DOM commit** — `flushSync(() => setIsPrinting(true))` forces React to commit the re-render synchronously so the updated inline token styles are in the DOM before `window.print()` captures the layout.
- **Remove `dark` class for CSS-driven styles** — `flushSync` fixes inline styles (React-owned). The `dark` class on `<html>` is temporarily removed before printing to reset `dark:prose-invert`, `dark:bg-*`, etc., then restored immediately after the dialog closes (`window.print()` is synchronous).

---

## MCP Testing & Bug Fixes

The application was tested end-to-end using **Playwright MCP** (`@playwright/mcp@latest --headless`) via Claude Code's MCP integration. 18 test cases were run across two viewports (1280×800 and 375×812).

### Test Results

| # | Test | Result |
|---|---|---|
| 1 | Dashboard loads with sample documents | ✅ Pass |
| 2 | New Document button creates doc and navigates to editor | ✅ Pass |
| 3 | Live preview updates as Markdown is typed | ✅ Pass |
| 4 | Title input syncs to toolbar center | ✅ Pass |
| 5 | Auto-save badge cycles Saving → Saved | ✅ Pass |
| 6 | Back ("← Docs") navigates to dashboard | ✅ Pass |
| 7 | Delete button removes document from list | ✅ Pass |
| 8 | Settings: Light/Dark theme toggle | ✅ Pass |
| 9 | Settings: Language switch EN ↔ 简体中文 | ✅ Pass |
| 10 | Dark mode renders correctly on dashboard and editor | ✅ Pass |
| 11 | Code block theme inverts relative to app theme | ✅ Pass |
| 12 | Preview toggle (hide/show, textarea expands) | ✅ Pass |
| 13 | Settings: Sync Scroll toggle on/off | ✅ Pass |
| 14 | Download .md — correct filename and content | ✅ Pass |
| 15 | Export PDF — `window.print()` called | ✅ Pass |
| 16 | `/preview/[id]` read-only view with syntax highlighting | ✅ Pass (bug fixed) |
| 17 | Not-found guard at `/edit/nonexistent-id` | ✅ Pass |
| 18 | Narrow viewport (375px) — dashboard and settings usable | ✅ Pass |

Screenshots from the test run are stored in `testImgs/`.

### Bug Found & Fixed

**Duplicate title on `/preview/[id]`**

The Playwright screenshot for test 16 revealed that the preview page rendered the document title twice — a large `<h1>` injected by the page layout, immediately followed by the `# Title` heading from the Markdown content.

**Root cause:** `app/preview/[id]/page.tsx` explicitly rendered `doc.title` as a standalone `<h1>` element. All sample documents also open their Markdown content with a matching `# Title` heading, causing the prose renderer to produce a second identical heading.

**Fix:** Removed the explicit title `<h1>` block from the page. The document content already carries the title as a Markdown heading.

```diff
- {/* Title */}
- <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">
-   {doc.title || t.untitled}
- </h1>
-
  {/* Content */}
```

**File changed:** `app/preview/[id]/page.tsx`

### UI/UX Observations

- **Editor at 375px** — the split-screen is functional but tight (~187px per pane) and the toolbar truncates long titles. Expected limitation of a split-screen design on narrow viewports.
- **"简体中文" at 375px** — the Chinese label wraps to two lines inside its option button on very narrow screens; renders correctly at all wider viewports.
- **Settings page** — clean two-card layout (APPEARANCE / EDITOR); Toggle and OptionButton controls are clearly labelled with visually distinct active states.
- **Print layout** — toolbar and textarea hidden via `print:hidden`; preview forced full-width via `print:!block print:!w-full`; page margin set to `1.5cm` in `globals.css`.

---

## Project Structure

```
app/
  page.tsx                  # Dashboard
  edit/[id]/page.tsx        # Editor route (Server Component shell)
  preview/[id]/page.tsx     # Read-only preview route
  settings/page.tsx         # Settings page
  layout.tsx                # Root layout with providers
  globals.css               # Global styles + print rules
components/
  Editor.tsx                # Split-screen editor (client component)
context/
  DocumentContext.tsx       # In-memory document store
  SettingsContext.tsx       # Theme, language, sync scroll
hooks/
  useMdComponents.tsx       # Shared Markdown component config (syntax highlighting)
lib/
  i18n.ts                   # Translation strings (EN / ZH)
testImgs/                   # Playwright test screenshots
DesignIteration.md          # Detailed design decision log
TestAndFix.md               # Full test run results and bug fix record
```
