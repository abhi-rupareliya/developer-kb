"use client";

import { Skeleton, Stack } from "@mui/material";
import { Message } from "@/types/graphql";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { EmptyState } from "@/components/ui/EmptyState";

type ChatMessageListProps = {
  messages: Message[];
  isLoading: boolean;
  streamedMessage?: Message | null;
  streamedContent?: string;
};

export function ChatMessageList({
  messages,
  isLoading,
  streamedMessage,
  streamedContent,
}: ChatMessageListProps) {
  const allMessages = streamedMessage
    ? [...messages, streamedMessage]
    : messages;

  if (isLoading && messages.length === 0) {
    return (
      <Stack spacing={1.25}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} variant="rounded" height={96} />
        ))}
      </Stack>
    );
  }

  if (allMessages.length === 0) {
    return (
      <EmptyState
        title="Start a conversation"
        description="Ask a question to generate an answer grounded in your selected documents."
      />
    );
  }

  return (
    <Stack spacing={1.25}>
      {allMessages.map((message) => (
        <ChatMessageBubble
          key={message.id}
          message={message}
          streamedContent={
            message.id === streamedMessage?.id ? streamedContent : undefined
          }
        />
      ))}
    </Stack>
  );
}
