'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react'
import { getTranslations, type Language, type Translations } from '@/lib/i18n'

export type Theme = 'light' | 'dark'

interface SettingsContextValue {
  theme: Theme
  setTheme: (t: Theme) => void
  language: Language
  setLanguage: (l: Language) => void
  syncScroll: boolean
  setSyncScroll: (v: boolean) => void
  t: Translations
}

const SettingsContext = createContext<SettingsContextValue | null>(null)

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('light')
  const [language, setLanguageState] = useState<Language>('en')
  const [syncScroll, setSyncScrollState] = useState<boolean>(true)

  // Apply / remove the `dark` class on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  }, [theme])

  const setTheme = useCallback((t: Theme) => setThemeState(t), [])
  const setLanguage = useCallback((l: Language) => setLanguageState(l), [])
  const setSyncScroll = useCallback((v: boolean) => setSyncScrollState(v), [])

  const t = getTranslations(language)

  return (
    <SettingsContext.Provider value={{ theme, setTheme, language, setLanguage, syncScroll, setSyncScroll, t }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings(): SettingsContextValue {
  const ctx = useContext(SettingsContext)
  if (!ctx) throw new Error('useSettings must be used inside <SettingsProvider>')
  return ctx
}
