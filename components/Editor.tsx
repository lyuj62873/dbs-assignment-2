'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { ArrowLeft, Check, Download, Eye, EyeOff, Printer } from 'lucide-react'
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

function ToolbarButton({
  onClick,
  title,
  children,
}: {
  onClick: () => void
  title: string
  children: React.ReactNode
}) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex items-center justify-center p-1.5 rounded text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    >
      {children}
    </button>
  )
}

interface EditorProps {
  id: string
}

export default function Editor({ id }: EditorProps) {
  const { getDocument, updateDocument } = useDocuments()
  const { t, syncScroll } = useSettings()
  const doc = getDocument(id)

  const [title, setTitle] = useState(doc?.title ?? '')
  const [content, setContent] = useState(doc?.content ?? '')
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showPreview, setShowPreview] = useState(true)
  const [isPrinting, setIsPrinting] = useState(false)

  const mdComponents = useMdComponents(isPrinting)

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

  const handleDownload = useCallback(() => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${title.trim() || 'untitled'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [content, title])

  const handleExportPdf = useCallback(() => {
    const root = document.documentElement
    const wasDark = root.classList.contains('dark')

    // Force React to synchronously commit isPrinting=true so the
    // syntax highlighter's inline token styles switch to oneDark
    // (light-mode code) before the browser captures the print layout.
    flushSync(() => setIsPrinting(true))

    // Strip the dark class so CSS-driven dark styles (prose-invert,
    // dark:bg-*, dark:text-*) revert to their light-mode values.
    if (wasDark) root.classList.remove('dark')

    window.print()

    // Restore everything after the print dialog closes.
    setIsPrinting(false)
    if (wasDark) root.classList.add('dark')
  }, [])

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
    <div className="flex flex-col h-screen overflow-hidden bg-white dark:bg-gray-900 transition-colors print:block print:h-auto print:overflow-visible">
      {/* Toolbar — hidden when printing */}
      <header className="grid grid-cols-3 items-center h-14 px-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm flex-shrink-0 z-10 transition-colors print:hidden">
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

        {/* Right: action buttons + save badge + preview toggle */}
        <div className="flex items-center justify-end gap-1">
          <ToolbarButton onClick={handleDownload} title={t.downloadMd}>
            <Download className="w-4 h-4" />
          </ToolbarButton>

          <ToolbarButton onClick={handleExportPdf} title={t.exportPdf}>
            <Printer className="w-4 h-4" />
          </ToolbarButton>

          {/* Subtle divider */}
          <span className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" aria-hidden />

          <SaveBadge
            status={saveStatus}
            savingLabel={t.saving}
            savedLabel={t.saved}
          />

          <ToolbarButton
            onClick={() => setShowPreview((v) => !v)}
            title={showPreview ? t.hidePreview : t.showPreview}
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </ToolbarButton>
        </div>
      </header>

      {/* Split body */}
      <div className="flex flex-1 overflow-hidden print:block print:overflow-visible">
        {/* Editor pane — hidden when printing */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onScroll={handleEditorScroll}
          className={`${
            showPreview ? 'w-1/2' : 'w-full'
          } h-full resize-none p-6 font-mono text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 outline-none focus:ring-0 overflow-y-auto leading-relaxed transition-colors print:hidden`}
          placeholder={t.markdownPlaceholder}
          aria-label="Markdown editor"
          spellCheck
        />

        {/* Preview pane — always in DOM so print CSS can target it.
            Visually hidden (display:none) when showPreview is false,
            but print:!block forces it visible during printing. */}
        <div
          ref={previewRef}
          className={`${
            showPreview ? 'w-1/2' : 'hidden'
          } h-full overflow-y-auto bg-white dark:bg-gray-900 transition-colors print:!block print:!w-full print:h-auto print:overflow-visible`}
        >
          <div className="p-8 max-w-none print:p-0">
            <article className="prose prose-gray dark:prose-invert max-w-none">
              {content ? (
                <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={mdComponents}>
                  {content}
                </ReactMarkdown>
              ) : (
                <p className="text-gray-400 dark:text-gray-500 italic not-prose print:hidden">
                  {t.previewPlaceholder}
                </p>
              )}
            </article>
          </div>
        </div>
      </div>
    </div>
  )
}
