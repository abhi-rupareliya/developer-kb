import { use } from 'react'
import { DocumentModalView } from '@/views/documents/DocumentModalView'

export default function DocumentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  return <DocumentModalView documentId={id} />
}
