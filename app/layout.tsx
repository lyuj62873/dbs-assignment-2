import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { DocumentProvider } from '@/context/DocumentContext'
import { SettingsProvider } from '@/context/SettingsContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Markdown Alchemist',
  description: 'A browser-based, high-performance Markdown editor for distraction-free writing.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body className="bg-white text-gray-900 antialiased">
        <SettingsProvider>
          <DocumentProvider>{children}</DocumentProvider>
        </SettingsProvider>
      </body>
    </html>
  )
}
