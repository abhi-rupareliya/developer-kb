'use client';

import { Box, Button, Typography } from '@mui/material';
import { ReactNode } from 'react';

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  icon?: ReactNode;
};

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <Box
      sx={{
        minHeight: 220,
        px: 2,
        py: 3,
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 1.5,
      }}
    >
      {icon ? (
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 44,
            height: 44,
            borderRadius: '50%',
            color: 'primary.main',
            bgcolor: 'rgba(37, 99, 235, 0.08)',
          }}
        >
          {icon}
        </Box>
      ) : null}
      <Box>
        <Typography variant="subtitle1">{title}</Typography>
        {description ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 360 }}>
            {description}
          </Typography>
        ) : null}
      </Box>
      {action ? (
        <Button variant="contained" size="small" onClick={action.onClick}>
          {action.label}
        </Button>
      ) : null}
    </Box>
  );
}
