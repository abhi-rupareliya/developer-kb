import { MAX_FILE_SIZE, SUPPORTED_MIME_TYPES } from "@/constants/Uploads";

export const validateFile = (file: File) => {
  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`${file.name} exceeds max size`);
  }

  if (!SUPPORTED_MIME_TYPES.includes(file.type)) {
    throw new Error(`${file.name} unsupported type`);
  }
};
