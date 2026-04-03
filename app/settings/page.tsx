'use client'

import Link from 'next/link'
import { Moon, Sun } from 'lucide-react'
import { useSettings, type Theme } from '@/context/SettingsContext'
import type { Language } from '@/lib/i18n'

function OptionButton<T extends string>({
  value,
  current,
  onSelect,
  children,
}: {
  value: T
  current: T
  onSelect: (v: T) => void
  children: React.ReactNode
}) {
  const active = value === current
  return (
    <button
      onClick={() => onSelect(value)}
      className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium border transition-all ${
        active
          ? 'bg-gray-900 text-white border-gray-900 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100'
          : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:border-gray-400'
      }`}
      aria-pressed={active}
    >
      {children}
    </button>
  )
}

function SettingRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
      <div className="flex gap-2">{children}</div>
    </div>
  )
}

export default function SettingsPage() {
  const { theme, setTheme, language, setLanguage, t } = useSettings()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-6 transition-colors">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="mb-10">
          <Link
            href="/"
            className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            {t.backToDashboard}
          </Link>
          <h1 className="mt-4 text-3xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {t.settingsTitle}
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm px-6">
          {/* Appearance section */}
          <div className="pt-5 pb-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
              {t.appearance}
            </p>
          </div>

          <SettingRow label={t.theme}>
            <OptionButton<Theme> value="light" current={theme} onSelect={setTheme}>
              <Sun className="w-4 h-4" />
              {t.light}
            </OptionButton>
            <OptionButton<Theme> value="dark" current={theme} onSelect={setTheme}>
              <Moon className="w-4 h-4" />
              {t.dark}
            </OptionButton>
          </SettingRow>

          <SettingRow label={t.language}>
            <OptionButton<Language> value="en" current={language} onSelect={setLanguage}>
              English
            </OptionButton>
            <OptionButton<Language> value="zh" current={language} onSelect={setLanguage}>
              简体中文
            </OptionButton>
          </SettingRow>
        </div>
      </div>
    </div>
  )
}
