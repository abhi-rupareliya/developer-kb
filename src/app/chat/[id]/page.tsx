import { HomePageView } from '@/views/home/HomePageView'

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <HomePageView activeChatId={id} isDraftChat={false} />
}
