import { MAX_FILE_SIZE, SUPPORTED_MIME_TYPES, SUPPORTED_EXTENSIONS } from "@/constants/Uploads";

export const validateFile = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${file.name} exceeds max size`);
  }

  // Check if MIME type is supported
  const isMimeSupported = SUPPORTED_MIME_TYPES.includes(file.type);

  // Check if file extension is supported
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  const isExtensionSupported = SUPPORTED_EXTENSIONS.includes(extension);

  if (!isMimeSupported && !isExtensionSupported) {
    throw new Error(`${file.name} unsupported type`);
  }
};
