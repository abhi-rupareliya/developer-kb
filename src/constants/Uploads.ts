export const MAX_FILE_SIZE = 5 * 1024 * 1024

export const FILE_TYPE_MAP = {
  pdf: {
    mime: ['application/pdf'],
    extensions: ['.pdf']
  },

  text: {
    mime: ['text/plain'],
    extensions: ['.txt']
  },

  javascript: {
    mime: ['application/javascript', 'text/javascript', 'application/x-javascript', 'text/plain'],
    extensions: ['.js', '.jsx']
  },

  typescript: {
    mime: ['application/typescript', 'text/typescript', 'video/mp2t', 'application/x-typescript', 'text/plain'],
    extensions: ['.ts', '.tsx']
  },

  json: {
    mime: ['application/json'],
    extensions: ['.json']
  },

  markdown: {
    mime: ['text/markdown'],
    extensions: ['.md']
  },

  python: {
    mime: ['text/x-python'],
    extensions: ['.py']
  },

  java: {
    mime: ['text/x-java-source', 'text/java'],
    extensions: ['.java']
  },

  cpp: {
    mime: ['text/x-c', 'text/x-c++'],
    extensions: ['.c', '.cpp', '.cc', '.cxx']
  },

  csharp: {
    mime: ['text/x-csharp'],
    extensions: ['.cs']
  },

  go: {
    mime: ['text/x-go'],
    extensions: ['.go']
  },

  rust: {
    mime: ['text/rust'],
    extensions: ['.rs']
  },

  php: {
    mime: ['application/x-php'],
    extensions: ['.php']
  },

  sql: {
    mime: ['application/sql', 'text/sql', 'application/x-sql'],
    extensions: ['.sql']
  },

  html: {
    mime: ['text/html'],
    extensions: ['.html', '.htm']
  },

  css: {
    mime: ['text/css'],
    extensions: ['.css']
  },

  scss: {
    mime: ['text/x-scss'],
    extensions: ['.scss']
  },

  less: {
    mime: ['text/x-less'],
    extensions: ['.less']
  },

  yaml: {
    mime: ['text/yaml', 'application/x-yaml'],
    extensions: ['.yaml', '.yml']
  }
} as const

export const SUPPORTED_MIME_TYPES = Object.values(FILE_TYPE_MAP).flatMap(t => t.mime) as string[]

export const SUPPORTED_EXTENSIONS = Object.values(FILE_TYPE_MAP).flatMap(t => t.extensions) as string[]

export const PROCESSING_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PROCESSED: 'processed',
  FAILED: 'failed'
} as const
