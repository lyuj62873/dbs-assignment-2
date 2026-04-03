'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Check, Eye, EyeOff } from 'lucide-react'
import { useDocuments } from '@/context/DocumentContext'
import { useSettings } from '@/context/SettingsContext'
import { useMdComponents } from '@/hooks/useMdComponents'

const REMARK_PLUGINS = [remarkGfm]

type SaveStatus = 'idle' | 'saving' | 'saved'

function SaveBadge({ status, savingLabel, savedLabel }: {
  status: SaveStatus
  savingLabel: string
  savedLabel: string
}) {
  if (status === 'idle') return null
  return (
    <span
      className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium transition-all ${
        status === 'saving'
          ? 'bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
          : 'bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800'
      }`}
    >
      {status === 'saving' ? (
        savingLabel
      ) : (
        <>
          <Check className="w-3 h-3" />
          {savedLabel}
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
  const { t, syncScroll } = useSettings()
  const mdComponents = useMdComponents()
  const doc = getDocument(id)

  const [title, setTitle] = useState(doc?.title ?? '')
  const [content, setContent] = useState(doc?.content ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showPreview, setShowPreview] = useState(true)

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)

  const handleEditorScroll = useCallback(() => {
    if (!syncScroll || !showPreview) return
    const ta = textareaRef.current
    const preview = previewRef.current
    if (!ta || !preview) return

    const scrollable = ta.scrollHeight - ta.clientHeight
    if (scrollable <= 0) return

    const ratio = ta.scrollTop / scrollable
    preview.scrollTop = ratio * (preview.scrollHeight - preview.clientHeight)
  }, [syncScroll, showPreview])

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
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
        <p>
          {t.documentNotFound}{' '}
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t.goBack}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900 transition-colors">
      {/* Toolbar */}
      <header className="grid grid-cols-3 items-center h-14 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 z-10 transition-colors">
        {/* Left: back link */}
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{t.docs}</span>
          </Link>
        </div>

        {/* Center: editable title */}
        <div className="flex justify-center px-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-center font-semibold text-gray-900 dark:text-gray-100 bg-transparent border-none outline-none focus:ring-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 truncate"
            placeholder={t.untitledPlaceholder}
            aria-label="Document title"
          />
        </div>

        {/* Right: save badge + preview toggle */}
        <div className="flex items-center justify-end gap-3">
          <SaveBadge
            status={saveStatus}
            savingLabel={t.saving}
            savedLabel={t.saved}
          />
          <button
            onClick={() => setShowPreview((v) => !v)}
            className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 px-2 py-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            title={showPreview ? t.hidePreview : t.showPreview}
            aria-label={showPreview ? t.hidePreview : t.showPreview}
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
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onScroll={handleEditorScroll}
          className={`${
            showPreview ? 'w-1/2' : 'w-full'
          } h-full resize-none p-6 font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 outline-none focus:ring-0 overflow-y-auto leading-relaxed transition-colors`}
          placeholder={t.markdownPlaceholder}
          aria-label="Markdown editor"
          spellCheck
        />

        {/* Preview pane */}
        {showPreview && (
          <div ref={previewRef} className="w-1/2 h-full overflow-y-auto bg-white dark:bg-gray-900 transition-colors">
            <div className="p-8 max-w-none">
              <article className="prose prose-gray dark:prose-invert max-w-none">
                {content ? (
                  <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={mdComponents}>
                    {content}
                  </ReactMarkdown>
                ) : (
                  <p className="text-gray-400 dark:text-gray-500 italic not-prose">
                    {t.previewPlaceholder}
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
