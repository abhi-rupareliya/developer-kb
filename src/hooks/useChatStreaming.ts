import { useState, useCallback } from 'react'

export function useChatStreaming() {
  const [isStreaming, setIsStreaming] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')

  const streamResponse = useCallback(async (question: string, documentIds: string[], chatId?: string) => {
    setIsStreaming(true)
    setStreamedContent('')

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          question,
          documentIds,
          chatId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to get response')
      }

      const reader = response.body?.getReader()
      if (!reader) return

      const decoder = new TextDecoder()
      let content = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        content += chunk
        setStreamedContent(content)
      }

      return content
    } catch (error) {
      console.error('Streaming error:', error)
      throw error
    } finally {
      setIsStreaming(false)
    }
  }, [])

  return {
    isStreaming,
    streamedContent,
    streamResponse
  }
}
