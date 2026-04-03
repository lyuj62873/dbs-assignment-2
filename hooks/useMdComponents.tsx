'use client'

import { useMemo } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useSettings } from '@/context/SettingsContext'
import type { Components } from 'react-markdown'

export function useMdComponents(): Components {
  const { theme } = useSettings()

  return useMemo(
    () => ({
      code({ className, children, ...rest }) {
        const match = /language-(\w+)/.exec(className ?? '')
        if (match) {
          return (
            <SyntaxHighlighter
              language={match[1]}
              style={theme === 'dark' ? oneDark : oneLight}
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
    }),
    [theme]
  )
}
