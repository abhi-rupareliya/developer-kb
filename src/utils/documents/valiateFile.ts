import { MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '@/constants/Uploads'

// Validation
export const validateFile = (file: File): string | null => {
  if (file.size > MAX_FILE_SIZE) {
    return `File size exceeds ${Math.round(MAX_FILE_SIZE / (1024 * 1024))}MB`
  }

  const extension = `.${file.name.split('.').pop()?.toLowerCase()}`
  if (!SUPPORTED_EXTENSIONS.includes(extension)) {
    return `Unsupported file type`
  }

  return null
}
