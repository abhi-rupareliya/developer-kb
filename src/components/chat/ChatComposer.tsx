'use client';

import { Box, Button, Chip, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import SendRoundedIcon from '@mui/icons-material/SendRounded';
import { useState } from 'react';

type ChatComposerProps = {
  disabled?: boolean;
  isStreaming?: boolean;
  selectedCount: number;
  onSend: (message: string) => Promise<void>;
};

export function ChatComposer({ disabled = false, isStreaming = false, selectedCount, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('');
  const [sending, setSending] = useState(false);

  const handleSend = async () => {
    const trimmed = value.trim();
    if (!trimmed || disabled || sending || isStreaming) return;

    setSending(true);
    try {
      await onSend(trimmed);
      setValue('');
    } finally {
      setSending(false);
    }
  };

  return (
    <Box
      sx={{
        width: '100%',
        p: { xs: 2, md: 3 },
        pb: { xs: 3, md: 4 },
        display: 'flex',
        justifyContent: 'center',
        bgcolor: 'transparent',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: 820,
          position: 'relative',
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 3,
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
          overflow: 'hidden',
          transition: 'border-color 0.15s, box-shadow 0.15s',
          '&:focus-within': {
            borderColor: 'primary.main',
            boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
          }
        }}
      >
        <Stack spacing={0}>
          {selectedCount > 0 && (
            <Box sx={{ px: 2, pt: 1.5 }}>
              <Chip 
                size="small" 
                label={`${selectedCount} document${selectedCount === 1 ? '' : 's'} selected`}
                sx={{ 
                  borderRadius: 1, 
                  bgcolor: 'action.hover',
                  fontSize: '0.75rem',
                  fontWeight: 500,
                  height: 24,
                }} 
              />
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            minRows={1}
            maxRows={12}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Type a message..."
            disabled={disabled || sending || isStreaming}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            sx={{
              '& .MuiOutlinedInput-root': {
                border: 'none',
                p: 2,
                fontSize: '0.9375rem',
                '& fieldset': { border: 'none' },
              }
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, pb: 1.5 }}>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {/* Optional: Add file upload or other action icons here */}
            </Box>

            <Button
              variant="contained"
              size="small"
              onClick={() => void handleSend()}
              disabled={!value.trim() || disabled || sending || isStreaming}
              sx={{
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: 2,
                p: 0,
                boxShadow: 'none',
                '&:hover': { boxShadow: 'none' }
              }}
            >
              {sending || isStreaming ? (
                <CircularProgress size={18} color="inherit" thickness={5} />
              ) : (
                <SendRoundedIcon sx={{ fontSize: 20 }} />
              )}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Box>
  );
}

