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
  {
    id: uuidv4(),
    title: 'Code Showcase',
    content: `# Code Showcase

A tour of syntax highlighting across four languages.

---

## JavaScript

Async/await with error handling:

\`\`\`javascript
async function fetchUser(id) {
  const res = await fetch(\`/api/users/\${id}\`)
  if (!res.ok) throw new Error(\`HTTP \${res.status}\`)

  const user = await res.json()
  return user
}

fetchUser(42)
  .then(user => console.log('Got user:', user.name))
  .catch(err => console.error('Failed:', err.message))
\`\`\`

---

## Python

Fibonacci with type hints and a generator:

\`\`\`python
from typing import Generator

def fibonacci(limit: int) -> Generator[int, None, None]:
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

# Print all Fibonacci numbers below 1000
for n in fibonacci(1000):
    print(n, end=" ")
\`\`\`

---

## Java

A generic stack implementation:

\`\`\`java
import java.util.ArrayDeque;
import java.util.Deque;
import java.util.NoSuchElementException;

public class Stack<T> {
    private final Deque<T> deque = new ArrayDeque<>();

    public void push(T item) {
        deque.push(item);
    }

    public T pop() {
        if (deque.isEmpty()) throw new NoSuchElementException("Stack is empty");
        return deque.pop();
    }

    public T peek() {
        if (deque.isEmpty()) throw new NoSuchElementException("Stack is empty");
        return deque.peek();
    }

    public boolean isEmpty() {
        return deque.isEmpty();
    }

    public static void main(String[] args) {
        Stack<Integer> stack = new Stack<>();
        stack.push(1);
        stack.push(2);
        stack.push(3);
        System.out.println(stack.pop()); // 3
        System.out.println(stack.peek()); // 2
    }
}
\`\`\`

---

## MySQL

Top customers by total spend with a subquery:

\`\`\`sql
SELECT
  u.id,
  u.name,
  u.email,
  SUM(o.total_amount)  AS total_spent,
  COUNT(o.id)          AS order_count,
  AVG(o.total_amount)  AS avg_order_value
FROM users u
INNER JOIN orders o ON u.id = o.user_id
WHERE o.status = 'completed'
  AND o.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.name, u.email
HAVING total_spent > 1000
ORDER BY total_spent DESC
LIMIT 20;
\`\`\`
`,
    updatedAt: Date.now() - 5 * 60 * 1000,
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
