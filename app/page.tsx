'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { useDocuments } from '@/context/DocumentContext'

function relativeTime(ts: number): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return 'Just now'
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`
  return `${Math.floor(diff / 86_400_000)}d ago`
}

export default function DashboardPage() {
  const router = useRouter()
  const { documents, createDocument, deleteDocument } = useDocuments()

  const handleNewDocument = () => {
    const doc = createDocument()
    router.push(`/edit/${doc.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
              Markdown Alchemist
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {documents.length} {documents.length === 1 ? 'document' : 'documents'}
            </p>
          </div>
          <button
            onClick={handleNewDocument}
            className="flex items-center gap-2 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Document
          </button>
        </div>

        {/* Document list */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="w-10 h-10 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">No documents yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create one to get started.
            </p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <div className="group flex items-center justify-between bg-white border border-gray-200 rounded-lg px-4 py-3.5 hover:border-gray-300 hover:shadow-sm transition-all">
                  <Link
                    href={`/edit/${doc.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 truncate">
                        {doc.title || 'Untitled'}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {relativeTime(doc.updatedAt)}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="ml-4 opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 transition-all"
                    aria-label={`Delete "${doc.title}"`}
                  >
                    <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        {/* Footer nav */}
        <div className="mt-10 flex justify-end">
          <Link
            href="/settings"
            className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
          >
            Settings
          </Link>
        </div>
      </div>
    </main>
  )
}
