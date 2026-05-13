"use client";

import { useState } from "react";
import { Box, IconButton, Tooltip, Typography } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

type ChatCodeBlockProps = {
  language?: string;
  children: string;
};

export function ChatCodeBlock({ language, children }: ChatCodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(children);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <Box sx={{ position: "relative", my: 1.5, minWidth: 0, maxWidth: '100%', overflow: 'hidden' }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 1.5,
          py: 1,
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
          border: "1px solid",
          borderColor: "divider",
          borderBottom: 0,
          bgcolor: "rgba(15, 23, 42, 0.92)",
        }}
      >
        <Typography variant="caption" sx={{ color: "rgba(255,255,255,0.72)" }}>
          {language || "code"}
        </Typography>
        <Tooltip title={copied ? "Copied" : "Copy code"}>
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{ color: "rgba(255,255,255,0.72)" }}
          >
            <ContentCopyIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <SyntaxHighlighter
        style={vscDarkPlus}
        language={language}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
          fontSize: "12px",
          lineHeight: 1.6,
          overflowX: "auto",
          whiteSpace: "pre",
        }}
      >
        {children.replace(/\n$/, "")}
      </SyntaxHighlighter>
    </Box>
  );
}
