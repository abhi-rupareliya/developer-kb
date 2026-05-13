'use client';

import { Box, Typography, type SxProps, type Theme } from '@mui/material';
import { ReactNode } from 'react';

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  sx?: SxProps<Theme>;
};

export function SectionHeader({ title, subtitle, action, sx }: SectionHeaderProps) {
  return (
    <Box
      sx={[
        {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        minWidth: 0,
        },
        ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
      ]}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="subtitle1" noWrap>
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="caption" color="text.secondary" noWrap>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action}
    </Box>
  );
}
