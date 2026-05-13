"use client";

import { Avatar, Box, Typography } from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import { Message } from "@/types/graphql";
import { ChatMarkdown } from "./ChatMarkdown";
import { TypingIndicator } from "./TypingIndicator";

type ChatMessageBubbleProps = {
  message: Message;
  streamedContent?: string;
};

export function ChatMessageBubble({
  message,
  streamedContent,
}: ChatMessageBubbleProps) {
  const content =
    message.id === "streaming" ? (streamedContent ?? "") : message.content;
  const isStreaming = message.id === "streaming";
  const isUser = message.role === "user";

  return (
    <Box
      sx={{
        width: "100%",
        py: 2,
        px: { xs: 2, md: 0 },
        display: "flex",
        justifyContent: "center",
        bgcolor: isUser ? "transparent" : "background.surface",
        borderBottom: isUser ? "none" : "1px solid",
        borderColor: "border.subtle",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 820,
          display: "flex",
          gap: 3,
          alignItems: "flex-end",
        }}
      >

        <Box sx={{ flex: 1, minWidth: 0, pt: 0.25 }}>
          {isUser ? (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                color: "text.primary",
                lineHeight: 1.6,
                fontWeight: 500,
              }}
            >
              {content}
            </Typography>
          ) : (
            <Box
              sx={{
                "& p": { mt: 0, mb: 1.5, "&:last-child": { mb: 0 } },
                "& pre": { my: 1.5 },
                color: "text.primary",
              }}
            >
              <ChatMarkdown content={content} />
              {isStreaming ? <TypingIndicator /> : null}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
