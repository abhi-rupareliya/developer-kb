"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";
import { Alert, Box, Button, Divider, Skeleton, Stack } from "@mui/material";
import { useRouter } from "next/navigation";
import { useChat } from "@/contexts/chat-context";
import { GET_CHAT, GET_MESSAGES } from "@/graphql/queries";
import { CREATE_CHAT, CREATE_MESSAGE, DELETE_CHAT } from "@/graphql/mutations";
import { Chat, Message } from "@/types/graphql";
import { useChatStreaming } from "@/hooks/useChatStreaming";
import { processSourceReferences } from "@/utils/processSourceReferences";
import { toErrorMessage } from "@/utils/error-utils";
import { AppPanel } from "@/components/ui/AppPanel";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { ChatMessageList } from "./ChatMessageList";
import { ChatComposer } from "./ChatComposer";

type ChatMessagesProps = {
  activeChatId: string | null;
  isDraftChat: boolean;
};

export function ChatMessages({ activeChatId, isDraftChat }: ChatMessagesProps) {
  const { selectedDocumentIds } = useChat();
  const router = useRouter();
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [streamedMessage, setStreamedMessage] = useState<Message | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [createChat] = useMutation<{ createChat: { chat: Chat | null } }>(
    CREATE_CHAT,
  );
  const [createMessage] = useMutation(CREATE_MESSAGE);
  const [deleteChat] = useMutation(DELETE_CHAT);
  const { isStreaming, streamedContent, streamResponse } = useChatStreaming();

  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
    refetch: refetchChat,
  } = useQuery<{ chat: Chat }>(GET_CHAT, {
    variables: { id: activeChatId },
    skip: !activeChatId,
  });

  const {
    data: messagesData,
    loading: messagesLoading,
    error: messagesError,
    refetch: refetchMessages,
  } = useQuery<{
    messages: {
      messages: Message[];
      total: number;
      page: number;
      limit: number;
      totalPages: number;
      hasMore: boolean;
    };
  }>(GET_MESSAGES, {
    variables: { chatId: activeChatId, page: 1, limit: 50 },
    skip: !activeChatId,
    fetchPolicy: "cache-and-network",
  });

  const chatTitle = useMemo(() => {
    if (!activeChatId) return "New Chat";
    return chatData?.chat?.title || "Untitled Chat";
  }, [activeChatId, chatData?.chat?.title]);

  const messages = messagesData?.messages?.messages ?? [];
  const streamPreview = streamedMessage
    ? {
        ...streamedMessage,
        content: processSourceReferences(streamedContent),
      }
    : null;

  useEffect(() => {
    if (!messagesContainerRef.current) return;
    messagesContainerRef.current.scrollTo({
      top: messagesContainerRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages.length, streamedContent]);

  const loadErrorMessage = chatError?.message ?? messagesError?.message ?? null;
  const displayErrorMessage = errorMessage ?? loadErrorMessage;

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;

    setErrorMessage(null);
    let chatIdToUse = activeChatId;
    let createdChatId: string | null = null;

    try {
      if (!chatIdToUse) {
        const title = message.trim().slice(0, 60) || "New Chat";
        const result = await createChat({
          variables: { input: { title } },
        });

        createdChatId = result.data?.createChat?.chat?.id ?? null;
        chatIdToUse = createdChatId;

        if (!chatIdToUse) {
          throw new Error("Failed to create chat");
        }
      }

      await createMessage({
        variables: {
          input: {
            chat_id: chatIdToUse,
            role: "user",
            content: message,
            metadata: { selectedDocuments: selectedDocumentIds },
          },
        },
      });

      const tempMessage: Message = {
        id: "streaming",
        chat_id: chatIdToUse,
        role: "assistant",
        content: "",
        metadata: null,
        created_at: new Date().toISOString(),
      };

      setStreamedMessage(tempMessage);
      const assistantContent = await streamResponse(
        message,
        selectedDocumentIds,
      );

      await createMessage({
        variables: {
          input: {
            chat_id: chatIdToUse,
            role: "assistant",
            content: assistantContent,
          },
        },
      });

      setStreamedMessage(null);

      if (activeChatId) {
        await refetchMessages();
        await refetchChat();
      }

      if (!activeChatId && chatIdToUse) {
        router.replace(`/chat/${chatIdToUse}`);
      }
    } catch (sendError) {
      setStreamedMessage(null);
      const messageText = toErrorMessage(sendError);
      setErrorMessage(messageText);

      if (createdChatId) {
        try {
          await deleteChat({ variables: { id: createdChatId } });
        } catch (deleteError) {
          console.error("Failed to rollback temporary chat:", deleteError);
        }
      }
    }
  };

  const selectedCount = selectedDocumentIds.length;

  return (
    <AppPanel dense sx={{ height: "100%", minHeight: 0 }}>
      <Stack sx={{ flex: 1, minHeight: 0 }}>
        <Box sx={{ px: 2, py: 1.5 }}>
          <SectionHeader
            title={chatTitle}
            subtitle={
              activeChatId
                ? "Conversation"
                : isDraftChat
                  ? "Draft conversation"
                  : "Select a chat to continue"
            }
          />
        </Box>
        <Divider />

        <Box
          ref={messagesContainerRef}
          sx={{
            flex: 1,
            overflow: "auto",
            px: { xs: 1.5, md: 2 },
            py: 2,
            bgcolor: "background.default",
          }}
        >
          {displayErrorMessage ? (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              action={
                activeChatId ? (
                  <Button
                    color="inherit"
                    size="small"
                    onClick={() => void refetchMessages()}
                  >
                    Retry
                  </Button>
                ) : null
              }
            >
              {displayErrorMessage}
            </Alert>
          ) : null}

          {chatLoading && activeChatId ? (
            <Stack spacing={1.25}>
              <Skeleton variant="rounded" height={92} />
              <Skeleton variant="rounded" height={74} />
              <Skeleton variant="rounded" height={92} />
            </Stack>
          ) : (
            <ChatMessageList
              messages={messages}
              isLoading={messagesLoading}
              streamedMessage={streamPreview}
              streamedContent={streamedContent}
            />
          )}
        </Box>

        <Divider />
        <Box sx={{ bgcolor: "background.paper" }}>
          <ChatComposer
            disabled={false}
            isStreaming={isStreaming}
            selectedCount={selectedCount}
            onSend={handleSendMessage}
          />
        </Box>
      </Stack>
    </AppPanel>
  );
}
