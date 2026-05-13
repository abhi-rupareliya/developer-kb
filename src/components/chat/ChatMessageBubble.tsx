"use client";

import { Avatar, Box, Paper, Typography } from "@mui/material";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ShieldRoundedIcon from "@mui/icons-material/ShieldRounded";
import { Message } from "@/types/graphql";
import { ChatMarkdown } from "./ChatMarkdown";
import { TypingIndicator } from "./TypingIndicator";

type ChatMessageBubbleProps = {
  message: Message;
  streamedContent?: string;
};

const roleMeta = {
  user: {
    label: "You",
    icon: <PersonRoundedIcon fontSize="small" />,
    align: "flex-end",
    avatarBg: "primary.main",
    paperBg: "primary.main",
    paperFg: "primary.contrastText",
  },
  assistant: {
    label: "Assistant",
    icon: <SmartToyRoundedIcon fontSize="small" />,
    align: "flex-start",
    avatarBg: "rgba(37, 99, 235, 0.10)",
    paperBg: "background.paper",
    paperFg: "text.primary",
  },
  system: {
    label: "System",
    icon: <ShieldRoundedIcon fontSize="small" />,
    align: "center",
    avatarBg: "rgba(15, 118, 110, 0.10)",
    paperBg: "rgba(15, 118, 110, 0.06)",
    paperFg: "text.primary",
  },
} as const;

export function ChatMessageBubble({
  message,
  streamedContent,
}: ChatMessageBubbleProps) {
  const meta = roleMeta[message.role];
  const content =
    message.id === "streaming" ? (streamedContent ?? "") : message.content;
  const isStreaming = message.id === "streaming";

  return (
    <Box
      sx={{
        maxWidth: "100%",
        display: "flex",
        justifyContent:
          meta.align === "flex-end"
            ? "flex-end"
            : meta.align === "center"
              ? "center"
              : "flex-start",
      }}
    >
      <Box
        sx={{
          width: meta.align === "flex-end" ? "min(fit-content, 350px)" : "100%",
          display: "flex",
          flexDirection: meta.align === "flex-end" ? "row-reverse" : "row",
          alignItems: "flex-start",
          gap: 1.25,
        }}
      >
        {meta.align !== "center" ? (
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: meta.avatarBg,
              color:
                meta.align === "flex-end"
                  ? "primary.contrastText"
                  : "primary.main",
            }}
          >
            {meta.icon}
          </Avatar>
        ) : null}
        <Paper
          sx={{
            flex: 1,
            px: 1.5,
            py: 1.25,
            borderRadius: 3,
            bgcolor: meta.paperBg,
            color: meta.paperFg,
            borderColor: "transparent",
            boxShadow: "0 12px 26px rgba(37, 99, 235, 0.14)",
            maxWidth: "90%",
          }}
        >
          {message.role === "assistant" ||
          message.role === "system" ||
          message.id === "streaming" ? (
            <Box sx={{ "& p": { mt: 0 } }}>
              <ChatMarkdown content={content} />
              {isStreaming ? <TypingIndicator /> : null}
            </Box>
          ) : (
            <Typography
              variant="body2"
              sx={{
                whiteSpace: "pre-wrap",
                lineHeight: 1.65,
                wordBreak: "break-word",
              }}
            >
              {content}
            </Typography>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
