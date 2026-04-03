'use client'

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react'
import { v4 as uuidv4 } from 'uuid'

export interface Document {
  id: string
  title: string
  content: string
  updatedAt: number
}

interface DocumentContextValue {
  documents: Document[]
  createDocument: () => Document
  updateDocument: (id: string, patch: Partial<Omit<Document, 'id'>>) => void
  deleteDocument: (id: string) => void
  getDocument: (id: string) => Document | undefined
}

const DocumentContext = createContext<DocumentContextValue | null>(null)

const SAMPLE_DOCS: Document[] = [
  {
    id: uuidv4(),
    title: 'Welcome to Markdown Alchemist',
    content: `# Welcome to Markdown Alchemist

A **distraction-free** Markdown editor built for focused writing.

## Features

- Real-time split-screen preview
- Auto-saving to in-memory state
- Clean, minimal UI

Start typing on the left — the preview updates instantly on the right.
`,
    updatedAt: Date.now(),
  },
  {
    id: uuidv4(),
    title: 'GFM Showcase',
    content: `## GitHub Flavored Markdown

### Task Lists

- [x] Write the context provider
- [x] Build the split-screen editor
- [ ] Customize the settings page

### Tables

| Feature       | Status  |
|---------------|---------|
| Editor        | ✅ Done  |
| Dashboard     | ✅ Done  |
| Preview route | ✅ Done  |
| Settings      | 🚧 Stub  |

### Code

\`\`\`typescript
const greet = (name: string) => \`Hello, \${name}!\`
\`\`\`

> Blockquotes work too — great for callouts and citations.
`,
    updatedAt: Date.now() - 2 * 60 * 1000,
  },
  {
    id: uuidv4(),
    title: 'Quick Notes',
    content: `# Quick Notes

A scratch pad for ideas.

- Idea 1
- Idea 2
- Idea 3
`,
    updatedAt: Date.now() - 60 * 60 * 1000,
  },
]

export function DocumentProvider({ children }: { children: ReactNode }) {
  const [documents, setDocuments] = useState<Document[]>(() => SAMPLE_DOCS)

  const createDocument = useCallback((): Document => {
    const doc: Document = {
      id: uuidv4(),
      title: 'Untitled',
      content: '',
      updatedAt: Date.now(),
    }
    setDocuments((prev) => [doc, ...prev])
    return doc
  }, [])

  const updateDocument = useCallback(
    (id: string, patch: Partial<Omit<Document, 'id'>>) => {
      setDocuments((prev) =>
        prev.map((d) => (d.id === id ? { ...d, ...patch } : d))
      )
    },
    []
  )

  const deleteDocument = useCallback((id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id))
  }, [])

  const getDocument = useCallback(
    (id: string) => documents.find((d) => d.id === id),
    [documents]
  )

  return (
    <DocumentContext.Provider
      value={{ documents, createDocument, updateDocument, deleteDocument, getDocument }}
    >
      {children}
    </DocumentContext.Provider>
  )
}

export function useDocuments(): DocumentContextValue {
  const ctx = useContext(DocumentContext)
  if (!ctx) throw new Error('useDocuments must be used inside <DocumentProvider>')
  return ctx
}
