'use client';

import { Paper, PaperProps, Box } from '@mui/material';
import { ReactNode } from 'react';

type AppPanelProps = PaperProps & {
  children: ReactNode;
  dense?: boolean;
};

export function AppPanel({ children, dense = false, sx, ...props }: AppPanelProps) {
  return (
    <Box
      {...props}
      sx={[
        {
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
          height: '100%',
          bgcolor: 'transparent', // Let the workspace handle background
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <Box sx={{ minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {children}
      </Box>
    </Box>
  );
}

