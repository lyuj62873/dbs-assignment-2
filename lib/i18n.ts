export type Language = 'en' | 'zh'

export interface Translations {
  // Dashboard
  appTitle: string
  documents: string
  document: string
  newDocument: string
  noDocumentsYet: string
  createOneToStart: string
  settings: string
  justNow: string
  minutesAgo: (n: number) => string
  hoursAgo: (n: number) => string
  daysAgo: (n: number) => string
  deleteDocumentLabel: (title: string) => string
  untitled: string

  // Editor toolbar
  docs: string
  untitledPlaceholder: string
  saving: string
  saved: string
  hidePreview: string
  showPreview: string
  downloadMd: string
  exportPdf: string
  markdownPlaceholder: string
  previewPlaceholder: string
  documentNotFound: string
  goBack: string

  // Preview page
  editLink: string
  dashboard: string

  // Settings page
  settingsTitle: string
  backToDashboard: string
  appearance: string
  theme: string
  light: string
  dark: string
  language: string

  // Editor settings
  editorSection: string
  syncScroll: string
  syncScrollHint: string
}

const translations: Record<Language, Translations> = {
  en: {
    appTitle: 'Markdown Alchemist',
    documents: 'documents',
    document: 'document',
    newDocument: 'New Document',
    noDocumentsYet: 'No documents yet',
    createOneToStart: 'Create one to get started.',
    settings: 'Settings',
    justNow: 'Just now',
    minutesAgo: (n) => `${n}m ago`,
    hoursAgo: (n) => `${n}h ago`,
    daysAgo: (n) => `${n}d ago`,
    deleteDocumentLabel: (title) => `Delete "${title}"`,
    untitled: 'Untitled',

    docs: 'Docs',
    untitledPlaceholder: 'Untitled',
    saving: 'Saving...',
    saved: 'Saved',
    hidePreview: 'Hide preview',
    showPreview: 'Show preview',
    downloadMd: 'Download .md',
    exportPdf: 'Export PDF',
    markdownPlaceholder: 'Write Markdown here...',
    previewPlaceholder: 'Preview will appear here as you type...',
    documentNotFound: 'Document not found.',
    goBack: 'Go back',

    editLink: '← Edit',
    dashboard: 'Docs',

    settingsTitle: 'Settings',
    backToDashboard: '← Back to Dashboard',
    appearance: 'Appearance',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    language: 'Language',

    editorSection: 'Editor',
    syncScroll: 'Sync Scroll',
    syncScrollHint: 'Preview follows editor scroll position',
  },
  zh: {
    appTitle: 'Markdown 炼金术',
    documents: '篇文档',
    document: '篇文档',
    newDocument: '新建文档',
    noDocumentsYet: '暂无文档',
    createOneToStart: '创建一篇开始吧。',
    settings: '设置',
    justNow: '刚刚',
    minutesAgo: (n) => `${n} 分钟前`,
    hoursAgo: (n) => `${n} 小时前`,
    daysAgo: (n) => `${n} 天前`,
    deleteDocumentLabel: (title) => `删除"${title}"`,
    untitled: '未命名',

    docs: '文档',
    untitledPlaceholder: '未命名',
    saving: '保存中...',
    saved: '已保存',
    hidePreview: '隐藏预览',
    showPreview: '显示预览',
    downloadMd: '下载 .md',
    exportPdf: '导出 PDF',
    markdownPlaceholder: '在此输入 Markdown...',
    previewPlaceholder: '开始输入后，预览将显示在此处...',
    documentNotFound: '未找到文档。',
    goBack: '返回',

    editLink: '← 编辑',
    dashboard: '文档',

    settingsTitle: '设置',
    backToDashboard: '← 返回文档列表',
    appearance: '外观',
    theme: '主题',
    light: '浅色',
    dark: '深色',
    language: '语言',

    editorSection: '编辑器',
    syncScroll: '同步滚动',
    syncScrollHint: '预览区域跟随编辑区域滚动',
  },
}

export function getTranslations(lang: Language): Translations {
  return translations[lang]
}
