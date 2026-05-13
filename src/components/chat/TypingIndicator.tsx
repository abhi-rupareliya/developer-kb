'use client';

import { Box } from '@mui/material';

export function TypingIndicator() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.5 }}>
      {[0, 1, 2].map((dot) => (
        <Box
          key={dot}
          sx={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            bgcolor: 'text.secondary',
            opacity: 0.4,
            animation: 'typingPulse 1.4s infinite ease-in-out',
            animationDelay: `${dot * 0.2}s`,
            '@keyframes typingPulse': {
              '0%, 100%': { transform: 'scale(1)', opacity: 0.4 },
              '50%': { transform: 'scale(1.2)', opacity: 0.8 },
            },
          }}
          />
      ))}
    </Box>
  );
}
