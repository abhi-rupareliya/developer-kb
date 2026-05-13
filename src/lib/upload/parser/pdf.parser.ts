import 'pdf-parse/worker'
import { PDFParse } from 'pdf-parse'
import { ParsedDocument } from '@/types/uploads'

export const parsePdf = async (buffer: Buffer): Promise<ParsedDocument> => {
  const data = new PDFParse({ data: buffer })

  const textResult = await data.getText()
  const text = textResult.text

  return {
    text: text
  }
}
