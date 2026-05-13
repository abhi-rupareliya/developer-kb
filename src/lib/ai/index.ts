import { AI } from '@/constants/ai'
import { google } from '@ai-sdk/google'

export const gemini = google(AI.CHAT_GENERATION_MODEL)
