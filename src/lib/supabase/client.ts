import { ENV } from '@/constants/environment'
import { createBrowserClient } from '@supabase/ssr'

const supabaseUrl = ENV.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = ENV.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!)
