'use client';

import { Paper, PaperProps, Box } from '@mui/material';
import { ReactNode } from 'react';

type AppPanelProps = PaperProps & {
  children: ReactNode;
  dense?: boolean;
};

export function AppPanel({ children, dense = false, sx, ...props }: AppPanelProps) {
  return (
    <Paper
      {...props}
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          borderRadius: 3,
          overflow: 'hidden',
          boxShadow: '0 1px 1px rgba(15, 23, 42, 0.02), 0 10px 30px rgba(15, 23, 42, 0.04)',
          backgroundColor: 'background.paper',
        },
        dense && {
          borderRadius: 2.5,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </Box>
    </Paper>
  );
}
