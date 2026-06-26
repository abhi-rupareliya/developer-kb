export function getLanguage(filename?: string | null) {
  const ext = filename?.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'js':
      return 'javascript'
    case 'ts':
    case 'tsx':
      return 'typescript'
    case 'jsx':
      return 'jsx'
    case 'py':
      return 'python'
    case 'java':
      return 'java'
    case 'cpp':
    case 'c':
      return 'cpp'
    case 'cs':
      return 'csharp'
    case 'go':
      return 'go'
    case 'rs':
      return 'rust'
    case 'sql':
      return 'sql'
    case 'html':
      return 'html'
    case 'css':
      return 'css'
    case 'json':
      return 'json'
    case 'yaml':
    case 'yml':
      return 'yaml'
    case 'md':
      return 'markdown'
    case 'sh':
      return 'bash'
    default:
      return 'text'
  }
}
