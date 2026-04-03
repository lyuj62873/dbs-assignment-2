'use client'

import { useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useSettings } from '@/context/SettingsContext'
import type { Components } from 'react-markdown'

export function useMdComponents(forceLightMode = false): Components {
  const { theme } = useSettings()

  return useMemo(
    () => {
      // Requirement: code blocks contrast with the app background.
      //   Light app  → dark code block  (oneDark)
      //   Dark app   → light code block (oneLight)
      // When forceLightMode is true (PDF export), always use oneDark so the
      // printed page looks like light mode regardless of the active theme.
      const codeStyle = forceLightMode
        ? oneDark
        : theme === 'dark'
          ? oneLight
          : oneDark

      return {
        code({ className, children, ...rest }) {
          const match = /language-(\w+)/.exec(className ?? '')
          if (match) {
            return (
              <SyntaxHighlighter
                language={match[1]}
                style={codeStyle}
                PreTag="div"
                customStyle={{ borderRadius: '0.5rem', fontSize: '0.8125rem' }}
                {...(rest as object)}
              >
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            )
          }
          // inline code
          return (
            <code
              className={`${className ?? ''} px-1 py-0.5 rounded text-sm font-mono bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200`}
              {...rest}
            >
              {children}
            </code>
          )
        },
      }
    },
    [theme, forceLightMode]
  )
}
