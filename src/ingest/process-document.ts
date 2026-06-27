import { chunkText, embedText } from '@/lib/rag'
import { inngest } from '@/lib/inngest'
import { createAdminClient } from '@/lib/supabase/admin'
import { parseFileByType } from '@/lib/upload/parser'
import { PROCESSING_STATUS } from '@/constants/Uploads'

export const processDocument = inngest.createFunction(
  {
    id: 'process-document',
    triggers: [{ event: 'document.uploaded' }],
    retries: 0,
    onFailure: async ({ event }) => {
      const supabase = createAdminClient()
      const { documentId } = event.data.event.data

      await supabase.from('documents').update({ processing_status: PROCESSING_STATUS.FAILED }).eq('id', documentId)
    }
  },
  async ({ event, step }) => {
    const supabase = createAdminClient()
    const { documentId } = event.data

    // mark processing
    await step.run('mark-processing', async () => {
      const { error } = await supabase
        .from('documents')
        .update({
          processing_status: PROCESSING_STATUS.PROCESSING
        })
        .eq('id', documentId)

      if (error) throw error
    })

    // 1. fetch document
    const doc = await step.run('fetch-doc', async () => {
      const { data, error } = await supabase.from('documents').select('*').eq('id', documentId).single()

      if (error) throw error

      if (!data) {
        throw new Error('Document not found')
      }

      return data
    })

    // avoid duplicate processing
    if (doc.processing_status === PROCESSING_STATUS.PROCESSED) {
      return
    }

    // 2. download + extract text
    const text = await step.run('download-extract', async () => {
      const path = doc.storage_path

      const { data, error } = await supabase.storage.from('documents').download(path)

      if (error) throw error

      const buffer = Buffer.from(await data.arrayBuffer())

      const file = new File([buffer], doc.original_file_name, {
        type: doc.mime_type
      })

      const parsed = await parseFileByType(file, buffer)

      if (!parsed.text?.trim()) {
        throw new Error('No text extracted from file')
      }

      return parsed.text
    })

    // 3. chunk
    const chunks = await step.run('chunk', async () => {
      const result = chunkText(text)

      if (!result.length) {
        throw new Error('No chunks generated')
      }

      return result
    })

    // 4. embed all chunks
    const embeddings = await step.run('embed', async () => {
      return Promise.all(
        chunks.map(async chunk => {
          return embedText(chunk)
        })
      )
    })

    // 5. batch insert
    await step.run('store', async () => {
      // cleanup previous retry data
      await supabase.from('document_chunks').delete().eq('document_id', documentId)

      const rows = chunks.map((chunk, i) => ({
        document_id: documentId,
        chunk_index: i,
        content: chunk,
        token_count: chunk.length,
        embedding: embeddings[i]
      }))

      const { error } = await supabase.from('document_chunks').insert(rows)

      if (error) throw error
    })

    // 6. mark done
    await step.run('complete', async () => {
      const { error } = await supabase
        .from('documents')
        .update({ processing_status: PROCESSING_STATUS.PROCESSED })
        .eq('id', documentId)

      if (error) throw error
    })
  }
)
