import Link from 'next/link'

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-2xl font-semibold text-gray-800 mb-2">Settings</h1>
      <p className="text-gray-500 mb-6">
        Customization options are coming soon.
      </p>
      <Link
        href="/"
        className="text-sm text-blue-600 hover:underline"
      >
        ← Back to Dashboard
      </Link>
    </div>
  )
}
