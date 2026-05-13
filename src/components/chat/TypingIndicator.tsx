'use client';

import { Box } from '@mui/material';

export function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5 }}>
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            bgcolor: 'primary.main',
            opacity: 0.4 + dot * 0.2,
            animation: 'typingPulse 1.2s infinite ease-in-out',
            animationDelay: `${dot * 0.16}s`,
            '@keyframes typingPulse': {
              '0%, 80%, 100%': { transform: 'translateY(0)', opacity: 0.35 },
              '40%': { transform: 'translateY(-3px)', opacity: 1 },
            },
          }}
          />
      ))}
    </Box>
  );
}
