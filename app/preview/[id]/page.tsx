'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocuments } from '@/context/DocumentContext'
import { useSettings } from '@/context/SettingsContext'
import { useMdComponents } from '@/hooks/useMdComponents'

const REMARK_PLUGINS = [remarkGfm]

interface Props {
  params: { id: string }
}

export default function PreviewPage({ params }: Props) {
  const { getDocument } = useDocuments()
  const { t } = useSettings()
  const mdComponents = useMdComponents()
  const doc = getDocument(params.id)

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400 transition-colors">
        <p>
          {t.documentNotFound}{' '}
          <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
            {t.dashboard}
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8 text-sm">
          <Link
            href={`/edit/${params.id}`}
            className="text-blue-600 dark:text-blue-400 hover:underline"
          >
            {t.editLink}
          </Link>
          <Link
            href="/"
            className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t.dashboard}
          </Link>
        </div>

        {/* Content */}
        <article className="prose prose-gray dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={REMARK_PLUGINS} components={mdComponents}>
            {doc.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
