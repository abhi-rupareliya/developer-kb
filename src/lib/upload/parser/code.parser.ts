import { ParsedDocument } from "@/types/uploads";

export const parseCodeFile = async (
  buffer: Buffer,
): Promise<ParsedDocument> => {
  return {
    text: buffer.toString("utf-8"),
  };
};
