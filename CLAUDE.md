# Project: Markdown Alchemist
A browser-based, high-performance Markdown editor for distraction-free writing.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Components**: Lucide React for icons, React-Markdown for rendering.
- **State**: Client-side React Context (In-memory storage).

## Data Model
- **Document**:
  - `id`: string (UUID)
  - `title`: string
  - `content`: string (Markdown text)
  - `updatedAt`: number (Timestamp)

## Navigation (4 Routes)
1. `/`: Dashboard - List and manage documents.
2. `/edit/[id]`: Editor - Split-screen editing experience (Dynamic Route).
3. `/preview/[id]`: Preview - Full-screen read-only mode.
4. `/settings`: Settings - UI customization.
