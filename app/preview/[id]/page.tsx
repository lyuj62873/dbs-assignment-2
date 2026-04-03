'use client'

import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useDocuments } from '@/context/DocumentContext'

const REMARK_PLUGINS = [remarkGfm]

interface Props {
  params: { id: string }
}

export default function PreviewPage({ params }: Props) {
  const { getDocument } = useDocuments()
  const doc = getDocument(params.id)

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <p>
          Document not found.{' '}
          <Link href="/" className="text-blue-600 hover:underline">
            Dashboard
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-8 py-12">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8 text-sm">
          <Link
            href={`/edit/${params.id}`}
            className="text-blue-600 hover:underline"
          >
            ← Edit
          </Link>
          <Link href="/" className="text-gray-500 hover:text-gray-900 transition-colors">
            Docs
          </Link>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
          {doc.title || 'Untitled'}
        </h1>

        {/* Content */}
        <article className="prose prose-gray max-w-none">
          <ReactMarkdown remarkPlugins={REMARK_PLUGINS}>
            {doc.content}
          </ReactMarkdown>
        </article>
      </div>
    </div>
  )
}
