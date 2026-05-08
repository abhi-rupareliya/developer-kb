import { parsePdf } from "./pdf.parser";
import { parseCodeFile } from "./code.parser";

export const parseFileByType = async (file: File, buffer: Buffer) => {
  if (file.type === "application/pdf") {
    return parsePdf(buffer);
  }

  return parseCodeFile(buffer);
};
