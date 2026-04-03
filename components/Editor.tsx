'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { useDocuments } from '@/context/DocumentContext'

const REMARK_PLUGINS = [remarkGfm]

type SaveStatus = 'idle' | 'saving' | 'saved'

function SaveBadge({ status }: { status: SaveStatus }) {
  if (status === 'idle') return null
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
        status === 'saving'
          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
          : 'bg-green-50 text-green-700 border border-green-200'
      }`}
    >
      {status === 'saving' ? (
        'Saving...'
      ) : (
        <>
          <Check className="w-3 h-3" />
          Saved
        </>
      )}
    </span>
  )
}

interface EditorProps {
  id: string
}

export default function Editor({ id }: EditorProps) {
  const { getDocument, updateDocument } = useDocuments()
  const doc = getDocument(id)

  const [title, setTitle] = useState(doc?.title ?? '')
  const [content, setContent] = useState(doc?.content ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showPreview, setShowPreview] = useState(true)

  useEffect(() => {
    if (!doc) return
    setSaveStatus('saving')
    updateDocument(id, { title, content, updatedAt: Date.now() })
    const timer = setTimeout(() => setSaveStatus('saved'), 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title, content])

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>
          Document not found.{' '}
          <Link href="/" className="text-blue-600 hover:underline">
            Go back
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white">
      {/* Toolbar */}
      <header className="grid grid-cols-3 items-center h-14 px-4 border-b border-gray-200 bg-white shadow-sm flex-shrink-0 z-10">
        {/* Left: back link */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Docs</span>
          </Link>
        </div>

        {/* Center: editable title */}
        <div className="flex justify-center px-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-center font-semibold text-gray-900 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 truncate"
            placeholder="Untitled"
            aria-label="Document title"
          />
        </div>

        {/* Right: save badge + preview toggle */}
        <div className="flex items-center justify-end gap-3">
          <SaveBadge status={saveStatus} />
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            title={showPreview ? 'Hide preview' : 'Show preview'}
            aria-label={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Split body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Editor pane */}
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className={`${
            showPreview ? 'w-1/2' : 'w-full'
          } h-full resize-none p-6 font-mono text-sm text-gray-800 bg-white border-r border-gray-200 outline-none focus:ring-0 overflow-y-auto leading-relaxed`}
          placeholder="Write Markdown here..."
          aria-label="Markdown editor"
          spellCheck
        />

        {/* Preview pane */}
        {showPreview && (
          <div className="w-1/2 h-full overflow-y-auto bg-white">
            <div className="p-8 max-w-none">
              <article className="prose prose-gray max-w-none">
                {content ? (
                  <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-400 italic not-prose">
                    Preview will appear here as you type...
                  </p>
                )}
              </article>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
