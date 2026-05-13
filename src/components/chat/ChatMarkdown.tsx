'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Box, Link as MuiLink, Typography } from '@mui/material';
import { ChatCodeBlock } from './ChatCodeBlock';
import { SourceLink } from './SourceLink';

type ChatMarkdownProps = {
  content: string;
};

export function ChatMarkdown({ content }: ChatMarkdownProps) {
  return (
    <Box
      sx={{
        '& > :first-of-type': { mt: 0 },
        '& p': { mt: 0, mb: 1.25, lineHeight: 1.65 },
        '& ul, & ol': { pl: 2.5, my: 1 },
        '& li': { mb: 0.5 },
        '& h1, & h2, & h3, & h4': { mt: 2, mb: 1 },
        '& blockquote': {
          m: 0,
          my: 1.5,
          px: 1.5,
          py: 1,
          borderLeft: '3px solid',
          borderColor: 'primary.main',
          bgcolor: 'background.surface',
          borderRadius: 1,
        },
        '& table': {
          width: '100%',
          borderCollapse: 'collapse',
          my: 1.5,
          overflow: 'hidden',
          display: 'block',
        },
        '& th, & td': {
          border: '1px solid',
          borderColor: 'divider',
          px: 1,
          py: 0.75,
          textAlign: 'left',
          whiteSpace: 'nowrap',
        },
      }}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children }) {
            const match = /language-(\w+)/.exec(className || '');
            const isInline = !match;
            return !isInline && match ? (
              <ChatCodeBlock language={match[1]}>{String(children)}</ChatCodeBlock>
            ) : (
              <Box
                component="code"
                sx={{
                  px: 0.75,
                  py: 0.25,
                  borderRadius: 1,
                  bgcolor: 'action.hover',
                  color: 'text.primary',
                  fontFamily: 'ui-monospace, SFMono-Regular, monospace',
                  fontSize: '0.92em',
                }}
              >
                {children}
              </Box>
            );
          },
          a({ href, children }) {
            if (href?.toLowerCase().startsWith('documents/')) {
              return <SourceLink href={href}>{children}</SourceLink>;
            }

            return (
              <MuiLink href={href || '#'} target="_blank" rel="noreferrer" underline="hover">
                {children}
              </MuiLink>
            );
          },
          p: ({ children }) => <Typography variant="body2">{children}</Typography>,
          h1: ({ children }) => (
            <Typography variant="h5" component="h1">{children}</Typography>
          ),
          h2: ({ children }) => (
            <Typography variant="h6" component="h2">{children}</Typography>
          ),
          h3: ({ children }) => (
            <Typography variant="subtitle1" component="h3">{children}</Typography>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </Box>
  );
}
