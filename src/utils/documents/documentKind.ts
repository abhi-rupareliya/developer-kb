export type DocumentKind = 'markdown' | 'pdf' | 'code' | 'unknown'

/**
 * Determines the "kind" of document based on its MIME type and file name.
 */
export function getDocumentKind(mimeType?: string | null, fileName?: string | null): DocumentKind {
  const name = fileName?.toLowerCase() || ''

  if (mimeType === 'text/markdown' || name.endsWith('.md') || name.endsWith('.markdown')) {
    return 'markdown'
  }

  if (mimeType === 'application/pdf') {
    return 'pdf'
  }

  if (mimeType?.includes('text') || name.match(/\.(js|ts|jsx|tsx|py|java|cpp|cs|go|rs|php|sql|html|css|json)$/i)) {
    return 'code'
  }

  return 'unknown'
}
