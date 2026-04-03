# Design Iteration Log — Markdown Alchemist

A chronological record of every build phase, the decisions made, and the reasoning behind them.

---

## Iteration 1 — Project Scaffold & Core Editor

### Goal
Bootstrap the entire Next.js application from scratch and implement the primary feature: the split-screen Markdown editor at `/edit/[id]`.

### Decisions

**Framework & tooling**
- Next.js 14 App Router with TypeScript. The App Router's Server/Client component split was a deliberate choice — it lets us keep route files as lightweight Server Components while pushing interactivity down to `"use client"` leaf components.
- Tailwind CSS v3 (not v4). Tailwind v4 uses a completely different CSS-based config format; v3's `tailwind.config.ts` + `autoprefixer` setup is stable and well-understood.
- `react-markdown` + `remark-gfm` for rendering. GFM adds tables, task lists, and strikethrough on top of standard CommonMark.

**State management**
- Client-side React Context only (`DocumentContext`). No database, no localStorage — all documents live in memory for the session. This keeps the architecture simple and the data flow obvious.
- All context action functions (`createDocument`, `updateDocument`, `deleteDocument`) are wrapped in `useCallback` with empty dependency arrays, making their references stable. This prevents the auto-save `useEffect` in the editor from looping.

**`use client` boundary strategy**
The route file `app/edit/[id]/page.tsx` stays a Server Component — it only extracts `params.id` and passes it as a prop to `<Editor>`. The editor itself is `"use client"`. This is the canonical App Router pattern: keep pages as thin server shells, push the client boundary to the component that actually needs browser APIs.

**Toolbar layout**
Used CSS Grid (`grid-cols-3`) instead of Flexbox for the sticky toolbar. Flexbox with asymmetric left/right elements would push the title input off-center; a three-column grid guarantees the title is always perfectly centered regardless of how many buttons are on either side.

**Auto-save**
The `useEffect` watches `[title, content]`. On any change it immediately calls `updateDocument`, then sets a 600 ms timeout to flip the badge from "Saving…" to "Saved". Because the store is in-memory, "saving" is instantaneous — the delay is purely cosmetic, giving the user a clear signal that their change was captured.

**Preview pane**
The preview is always present in the DOM (not conditionally rendered). Hiding it is done via CSS (`hidden` class) rather than removing the element. This became important later for print export — a conditionally rendered element can't be targeted by `@media print` CSS.

### Files created
- `package.json`, `next.config.mjs`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `.gitignore`
- `app/globals.css`, `app/layout.tsx`
- `app/page.tsx` (Dashboard)
- `app/edit/[id]/page.tsx`
- `app/preview/[id]/page.tsx`
- `app/settings/page.tsx` (placeholder)
- `context/DocumentContext.tsx`
- `components/Editor.tsx`

---

## Iteration 2 — Settings: Dark Mode & i18n

### Goal
Turn the settings stub into a functional page with two options: light/dark theme and UI language (English / Simplified Chinese).

### Decisions

**Separate SettingsContext**
Theme and language are global UI concerns that have nothing to do with documents. Keeping them in a dedicated `SettingsContext` (separate from `DocumentContext`) respects the single-responsibility principle and makes each context easier to reason about.

**Class-based dark mode**
Tailwind's `darkMode: 'class'` strategy was chosen over `'media'`. Class-based mode gives the user explicit control (a toggle in Settings) rather than following the OS preference silently. The context applies/removes the `dark` class on `document.documentElement` in a `useEffect` whenever `theme` changes.

**Translation architecture**
A typed `Translations` interface in `lib/i18n.ts` defines every UI string as a named key. Both the `en` and `zh` objects must satisfy this interface, so TypeScript catches any missing key at compile time. The active translation object (`t`) is computed inside `SettingsContext` and passed down via context — components just call `t.someKey` with no conditional logic.

The app title ("Markdown Alchemist" → "Markdown 炼金术") is intentionally translated because this is a student project; in a real product, brand names are typically left in the original language.

**Settings UI pattern**
Appearance options (theme, language) use paired `OptionButton` components — a two-choice selector that makes the active state visually clear. Boolean options (added in a later iteration) use a sliding `Toggle` switch, which is the conventional UI for on/off settings.

### Files created / modified
- `lib/i18n.ts` (new)
- `context/SettingsContext.tsx` (new)
- `app/layout.tsx` — added `<SettingsProvider>`
- `app/settings/page.tsx` — replaced placeholder with real controls
- `app/page.tsx`, `components/Editor.tsx`, `app/preview/[id]/page.tsx` — added `dark:` variants and `useT()` calls

---

## Iteration 3 — Syntax Highlighting & Code Showcase Document

### Goal
Highlight code blocks in the Markdown preview according to programming language, and add a sample document that demonstrates Java, Python, JavaScript, and MySQL.

### Decisions

**Shared hook: `useMdComponents`**
Both the editor's preview pane and the standalone `/preview/[id]` page render Markdown. Putting the syntax highlighter logic in a shared `useMdComponents()` hook means both consumers get identical highlighting behavior with a single source of truth.

**Prism engine over highlight.js**
`react-syntax-highlighter` supports both. Prism was chosen for its broader language coverage and cleaner token granularity, which produces more accurate highlighting for mixed-syntax files (e.g., JSX, SQL dialects).

**`useMemo([theme])`**
The components object returned by `useMdComponents` is memoized on `theme`. Without this, every parent re-render would produce a new `components` object reference, causing `react-markdown` to unmount and remount all rendered nodes on every keystroke — a significant performance problem.

**Inline code vs. fenced code**
Both come through the `code` component in `react-markdown`. They're distinguished by the presence of a `language-xxx` className: fenced blocks always have one; inline code never does. Fenced blocks get `SyntaxHighlighter`; inline code gets a styled `<code>` tag.

**MySQL → `sql` language identifier**
Prism's bundled SQL highlighter covers MySQL syntax fully. Using `sql` as the fence language is more standard and avoids potential fallback issues with `mysql` as an identifier.

**`REMARK_PLUGINS` as a module-level constant**
Defining `[remarkGfm]` as a constant outside the component prevents a new array from being allocated on every render, which would cause `react-markdown` to re-parse the document unnecessarily.

### Files created / modified
- `hooks/useMdComponents.tsx` (new)
- `components/Editor.tsx` — imports and uses the hook
- `app/preview/[id]/page.tsx` — imports and uses the hook
- `context/DocumentContext.tsx` — added "Code Showcase" sample document
- `tailwind.config.ts` — added `hooks/**` to content paths

---

## Iteration 4 — Synchronized Scrolling Setting

### Goal
When the user scrolls the editor textarea, the preview pane scrolls to the same relative position. Controllable via a toggle in Settings (on by default).

### Decisions

**Scroll-ratio approach**
The editor and preview have different content heights (raw Markdown is typically shorter than its rendered HTML). A direct `scrollTop` copy would be wrong. Instead, the scroll position is expressed as a ratio — `scrollTop / (scrollHeight - clientHeight)` — and that ratio is applied to the preview's own scrollable range. This keeps both panes at the same *relative* position in the document.

**One-directional sync (editor → preview only)**
The user reads the preview by scrolling the editor. Bidirectional sync (preview scroll → editor) would create feedback loops and is not a use case the user asked for.

**No feedback loop guard needed**
Setting `element.scrollTop` directly in JavaScript does not fire a `scroll` event in modern browsers, so there is no risk of the programmatic preview scroll triggering another editor sync. A debounce or `isSyncing` ref guard was considered and deliberately omitted to keep the handler simple.

**`syncScroll` in SettingsContext**
Like theme and language, scroll sync is a UI preference that should persist across documents in the session. Storing it in `SettingsContext` (rather than local component state) makes it accessible from Settings and from the editor without prop-drilling.

**Settings UI: Toggle vs. OptionButton**
`OptionButton` pairs (used for theme and language) are appropriate for choosing between named discrete options. A sliding toggle switch is the conventional control for a single boolean preference. A `Toggle` component was added to the settings page alongside a new `SettingRow` `hint` prop to show a one-line description below the label.

### Files modified
- `lib/i18n.ts` — added `editorSection`, `syncScroll`, `syncScrollHint`
- `context/SettingsContext.tsx` — added `syncScroll` / `setSyncScroll`
- `app/settings/page.tsx` — added Editor section with `Toggle`
- `components/Editor.tsx` — added `textareaRef`, `previewRef`, `handleEditorScroll`, wired `onScroll`

---

## Iteration 5 — Download & Export PDF

### Goal
Let users download the raw Markdown as a `.md` file and export the rendered document as a PDF.

### Decisions

**PDF approach: browser print dialog**
Three options were considered:

| Option | Pros | Cons |
|---|---|---|
| `window.print()` | Zero dependencies, crisp vector text, proper pagination | One extra click in browser dialog |
| `html2canvas` + `jsPDF` | Fully programmatic download | +300 KB bundle, text rendered as image (not searchable), blurry on high-DPI |
| `@react-pdf/renderer` | True PDF, searchable text | Requires mapping Markdown AST to react-pdf components — significant complexity |

`window.print()` was chosen. The tradeoff (one extra user click) is acceptable; the quality and zero-dependency advantages are significant.

**Print layout via Tailwind `print:` variants**
Rather than a separate print stylesheet, print-specific classes are co-located on each element:
- Toolbar: `print:hidden`
- Textarea: `print:hidden`
- Root container: `print:block print:h-auto print:overflow-visible` (removes the `h-screen` clip)
- Preview pane: `print:!block print:!w-full` — the `!` (important) is necessary to override the `hidden` class's `display: none !important` when the preview toggle is off

**Preview always in DOM**
This decision from Iteration 1 pays off here. If the preview were conditionally rendered, it would be absent from the DOM when the preview toggle is off, making it impossible for `@media print` CSS to show it. Always keeping it in the DOM lets `print:!block` force it visible regardless of the toggle state.

**Download: Blob + object URL**
```
new Blob([content], { type: 'text/markdown' })
→ URL.createObjectURL(blob)
→ synthetic <a download="title.md"> click
→ URL.revokeObjectURL(url)
```
No libraries, no server round-trip, works in all modern browsers.

**Button placement: editor toolbar**
Both buttons live in the right side of the toolbar alongside the preview toggle, separated from the save badge by a thin divider. A `ToolbarButton` helper component was extracted to keep button styling consistent.

### Files modified
- `lib/i18n.ts` — added `downloadMd`, `exportPdf`
- `app/globals.css` — added `@page { margin: 1.5cm }` print rule
- `components/Editor.tsx` — added `handleDownload`, `handleExportPdf`, `ToolbarButton`, print `print:` classes

---

## Iteration 6 — Code Block Theme Inversion & Print Light-Mode Fix

### Goal
1. Invert the code block theme relative to the app theme (light app → dark code, dark app → light code) for visual contrast.
2. Ensure PDF export always produces light-mode output regardless of the currently active theme.

### Decisions

**Theme inversion (requirement 1)**
Previously the code block style matched the app theme (light → `oneLight`, dark → `oneDark`). The inverted mapping (light → `oneDark`, dark → `oneLight`) creates contrast between the code block and its surrounding background, making code easier to scan.

**Why `@media print` CSS alone cannot fix the PDF color problem**
`react-syntax-highlighter` writes every token's color as an inline `style` attribute on individual `<span>` elements. CSS rules — including `@media print` rules — cannot override inline styles without `!important` on every possible token color. That is not feasible. A React-level solution is required.

**`forceLightMode` parameter on `useMdComponents`**
The hook accepts an optional `forceLightMode` boolean. When `true`, it always picks `oneDark` (the light-mode code style) regardless of the active theme. The `useMemo` dependency array includes both `theme` and `forceLightMode` so the components object rebuilds correctly when either changes.

**`flushSync` for synchronous DOM commit**
The `handleExportPdf` function must ensure the React DOM is fully updated *before* calling `window.print()`. Normal `setState` is asynchronous — if `setIsPrinting(true)` were called without `flushSync`, React would batch the update and the DOM would still show the old (wrong) inline styles when the browser captures the print layout.

`flushSync(() => setIsPrinting(true))` forces React to synchronously commit the re-render. After it returns, the syntax highlighter's inline token styles in the DOM already reflect the light-mode palette.

**Removing the `dark` class for CSS-driven styles**
`flushSync` fixes inline styles (React-owned). But dark mode also affects CSS-class-driven styles: `dark:prose-invert`, `dark:bg-gray-900`, `dark:text-gray-100`, etc. These are controlled by the `dark` class on `<html>`. Temporarily removing it before `window.print()` resets all those styles to their light-mode values. The class is restored immediately after the print dialog closes.

`window.print()` is synchronous — it blocks JavaScript execution until the user dismisses the dialog — so the restore step runs at exactly the right moment with no timers needed.

**Full export sequence**
```
flushSync(() => setIsPrinting(true))   // React inline styles → oneDark
root.classList.remove('dark')          // CSS classes → light mode
window.print()                         // browser captures light-mode DOM
setIsPrinting(false)                   // React inline styles → normal
root.classList.add('dark')             // CSS classes → dark mode restored
```

### Files modified
- `hooks/useMdComponents.tsx` — swapped style mapping, added `forceLightMode` param
- `components/Editor.tsx` — added `isPrinting` state, `flushSync` import, updated `handleExportPdf`
