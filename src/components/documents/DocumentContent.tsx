'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  CircularProgress,
  IconButton, Typography
} from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import { Document as PDFDocument, Page as PDFPage, pdfjs } from 'react-pdf';
import { getDocumentKind } from '@/utils/documents/documentKind';
import { useDocumentContent } from './useDocumentContent';
import { Document } from '@/types/graphql';
import { ChatMarkdown } from '@/components/chat/ChatMarkdown';
import { ChatCodeBlock } from '@/components/chat/ChatCodeBlock';

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

if (typeof DOMMatrix === 'undefined') {
  // @ts-expect-error - DOMMatrix polyfill for PDF.js compatibility
  global.DOMMatrix = class DOMMatrix {
    constructor() {
      return this;
    }
  };
}

interface DocumentContentProps {
  document: Document;
}

function getLanguage(filename?: string | null) {
  const ext = filename?.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'js':
      return 'javascript';
    case 'ts':
    case 'tsx':
      return 'typescript';
    case 'jsx':
      return 'jsx';
    case 'py':
      return 'python';
    case 'java':
      return 'java';
    case 'cpp':
    case 'c':
      return 'cpp';
    case 'cs':
      return 'csharp';
    case 'go':
      return 'go';
    case 'rs':
      return 'rust';
    case 'sql':
      return 'sql';
    case 'html':
      return 'html';
    case 'css':
      return 'css';
    case 'json':
      return 'json';
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'md':
      return 'markdown';
    case 'sh':
      return 'bash';
    default:
      return 'text';
  }
}

export function DocumentContent({ document }: DocumentContentProps) {
  const kind = getDocumentKind(document.mime_type, document.original_file_name);
  const { content, loading: contentLoading, error: fetchError } = useDocumentContent(
    kind === 'markdown' || kind === 'code' ? document.id : null,
  );
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);

  if (fetchError) {
    return <Alert severity="error">{fetchError}</Alert>;
  }

  if (contentLoading) {
    return (
      <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (kind === 'markdown' && content) {
    return (
      <Box
        sx={{
          maxWidth: 920,
          mx: 'auto',
          px: { xs: 1.5, md: 3 },
          py: 2,
        }}
      >
        <ChatMarkdown content={content} />
      </Box>
    );
  }

  if (kind === 'code' && content) {
    return (
      <Box sx={{ px: { xs: 1.5, md: 3 }, py: 2 }}>
        <ChatCodeBlock language={getLanguage(document.original_file_name)}>{content}</ChatCodeBlock>
      </Box>
    );
  }

  if (kind === 'pdf') {
    return (
      <Box
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
          overflow: 'hidden',
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            p: 1.5,
            borderBottom: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.default',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              PDF preview
            </Typography>
            {numPages && numPages > 1 ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" disabled={pageNumber === 1} onClick={() => setPageNumber((value) => value - 1)}>
                  <NavigateBeforeIcon />
                </IconButton>
                <Typography variant="body2">
                  {pageNumber} / {numPages}
                </Typography>
                <IconButton size="small" disabled={pageNumber === numPages} onClick={() => setPageNumber((value) => value + 1)}>
                  <NavigateNextIcon />
                </IconButton>
              </Box>
            ) : null}
          </Box>
        </Box>

        <Box sx={{ minHeight: '68vh', overflow: 'auto', display: 'flex', justifyContent: 'center', bgcolor: 'grey.100' }}>
          <PDFDocument
            file={`/api/documents/${document.id}`}
            onLoadSuccess={({ numPages: nextNumPages }) => setNumPages(nextNumPages)}
            loading={
              <Box sx={{ minHeight: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            }
            error={<Alert severity="error">Failed to load PDF</Alert>}
          >
            <PDFPage
              pageNumber={pageNumber}
              width={Math.min(920, typeof window !== 'undefined' ? window.innerWidth - 96 : 920)}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          </PDFDocument>
        </Box>
      </Box>
    );
  }

  return (
    <Alert severity="info">
      This file type is stored and indexed, but there is no inline preview available yet.
    </Alert>
  );
}
