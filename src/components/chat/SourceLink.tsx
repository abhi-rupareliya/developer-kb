'use client';

import Link from 'next/link';
import { Box, Chip } from '@mui/material';
import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface SourceLinkProps {
  href: string;
  children: ReactNode;
}

export function SourceLink({ href, children }: SourceLinkProps) {
  const router = useRouter();
  const isSourceRef = href?.toLowerCase().startsWith('documents/');

  if (isSourceRef) {
    const documentId = href.split('/').pop();
    return (
      <Chip
        size="small"
        label={children}
        variant="outlined"
        onClick={() => router.push(`/documents/${documentId}`)}
        sx={{
          mx: 0.25,
          bgcolor: 'rgba(37, 99, 235, 0.04)',
          cursor: 'pointer',
          '& .MuiChip-label': {
            px: 1,
          },
        }}
      />
    );
  }

  return (
    <Link href={href} target="_blank" rel="noopener noreferrer">
      <Box
        component="span"
        sx={{
          color: 'primary.main',
          textDecoration: 'underline',
          textUnderlineOffset: '2px',
        }}
      >
        {children}
      </Box>
    </Link>
  );
}
