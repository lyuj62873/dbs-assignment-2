# Test & Fix Log — Markdown Alchemist

A record of the full Playwright functional test run, covering all four feature groups, UI/UX review, and any bugs found and fixed.

---

## Test Environment

- Browser: Chromium (headless via `@playwright/mcp@latest`)
- Base URL: `http://localhost:3000`
- Viewports tested: 1280×800 (default), 375×812 (mobile)

---

## Test Results

| # | Test | Result |
|---|---|---|
| 1 | Dashboard loads with sample documents | ✅ Pass |
| 2 | New Document button creates doc and navigates to editor | ✅ Pass |
| 3 | Live preview updates as Markdown is typed | ✅ Pass |
| 4 | Title input syncs to toolbar center | ✅ Pass |
| 5 | Auto-save badge cycles Saving → Saved | ✅ Pass |
| 6 | Back ("← Docs") navigates to dashboard | ✅ Pass |
| 7 | Delete button removes document from list | ✅ Pass |
| 8 | Settings: Light/Dark theme toggle applies `dark` class to `<html>` | ✅ Pass |
| 9 | Settings: Language switch EN ↔ 简体中文 updates all UI strings | ✅ Pass |
| 10 | Dark mode renders correctly on dashboard and editor | ✅ Pass |
| 11 | Code block theme inverts relative to app theme (light app → dark code, dark app → light code) | ✅ Pass |
| 12 | Preview toggle hides/shows preview pane; textarea expands to full width when hidden | ✅ Pass |
| 13 | Settings: Sync Scroll toggle switches on/off correctly | ✅ Pass |
| 14 | Download .md triggers file download with correct filename (`<title>.md`) and content | ✅ Pass |
| 15 | Export PDF calls `window.print()` | ✅ Pass |
| 16 | `/preview/[id]` renders full-screen read-only view with syntax highlighting | ✅ Pass (after fix — see below) |
| 17 | Not-found guard at `/edit/nonexistent-id` shows "Document not found. Go back" | ✅ Pass |
| 18 | Narrow viewport (375px) — dashboard and settings pages are usable | ✅ Pass |

---

## Bug Found & Fixed

### Duplicate title on `/preview/[id]`

**Symptom**
The preview page rendered the document title twice: once as a large `<h1>` injected by the page layout, and again from the `# Title` heading at the top of the document's Markdown content.

**Root cause**
`app/preview/[id]/page.tsx` explicitly rendered `doc.title` as an `<h1>` element (lines 54–57). All four sample documents also begin their content with a matching `# Title` heading, so the prose renderer produced a second identical heading immediately below.

**Fix**
Removed the explicit title `<h1>` block from the preview page. The Markdown content already contains the title as a heading, so the page renders cleanly without duplication.

```diff
- {/* Title */}
- <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-8 leading-tight">
-   {doc.title || t.untitled}
- </h1>
-
  {/* Content */}
```

**File changed:** `app/preview/[id]/page.tsx`

---

## UI/UX Observations

- **Editor at 375px**: The split-screen layout is functional but tight (~187px per pane). The toolbar truncates the document title. This is an expected limitation of a split-screen editor on narrow viewports, not a bug.
- **"简体中文" button at 375px**: The Chinese label wraps to two lines inside its option button on very narrow screens. Renders correctly at all wider viewports.
- **Settings page**: Clean two-card layout (APPEARANCE / EDITOR). Toggle and OptionButton controls are clearly labelled and visually distinct.
- **Print layout**: Toolbar and textarea hidden via `print:hidden`; preview pane forced full-width via `print:!block print:!w-full`. `@page { margin: 1.5cm }` applied in `globals.css`.
