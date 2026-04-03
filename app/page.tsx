'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { FileText, Plus, Trash2 } from 'lucide-react'
import { useDocuments } from '@/context/DocumentContext'
import { useSettings } from '@/context/SettingsContext'

function relativeTime(ts: number, t: ReturnType<typeof useSettings>['t']): string {
  const diff = Date.now() - ts
  if (diff < 60_000) return t.justNow
  if (diff < 3_600_000) return t.minutesAgo(Math.floor(diff / 60_000))
  if (diff < 86_400_000) return t.hoursAgo(Math.floor(diff / 3_600_000))
  return t.daysAgo(Math.floor(diff / 86_400_000))
}

export default function DashboardPage() {
  const router = useRouter()
  const { documents, createDocument, deleteDocument } = useDocuments()
  const { t } = useSettings()

  const handleNewDocument = () => {
    const doc = createDocument()
    router.push(`/edit/${doc.id}`)
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 transition-colors">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
              {t.appTitle}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {documents.length} {documents.length === 1 ? t.document : t.documents}
            </p>
          </div>
          <button
            onClick={handleNewDocument}
            className="flex items-center gap-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.newDocument}
          </button>
        </div>

        {/* Document list */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-4" />
            <p className="text-gray-500 dark:text-gray-400 font-medium">{t.noDocumentsYet}</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">{t.createOneToStart}</p>
          </div>
        ) : (
          <ul className="space-y-2">
            {documents.map((doc) => (
              <li key={doc.id}>
                <div className="group flex items-center justify-between bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3.5 hover:border-gray-300 dark:hover:border-gray-600 hover:shadow-sm transition-all">
                  <Link
                    href={`/edit/${doc.id}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                  >
                    <FileText className="w-4 h-4 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {doc.title || t.untitled}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                        {relativeTime(doc.updatedAt, t)}
                      </p>
                    </div>
                  </Link>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="ml-4 opacity-0 group-hover:opacity-100 p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
                    aria-label={t.deleteDocumentLabel(doc.title)}
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
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            {t.settings}
          </Link>
        </div>
      </div>
    </main>
  )
}
