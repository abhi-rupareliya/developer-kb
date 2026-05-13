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
    <Paper
      sx={{
        borderRadius: 0,
        borderLeft: 0,
        borderRight: 0,
        borderBottom: 0,
        bgcolor: 'background.paper',
        position: 'sticky',
        bottom: 0,
        zIndex: 2,
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Stack spacing={1}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={7}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder="Write a message..."
            disabled={disabled || sending || isStreaming}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleSend();
              }
            }}
            slotProps={{
              htmlInput: {
                'aria-label': 'Chat message input',
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
              {selectedCount > 0 ? (
                <Chip size="small" label={`${selectedCount} document${selectedCount === 1 ? '' : 's'} selected`} />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  No documents selected
                </Typography>
              )}
            </Box>

            <Button
              variant="contained"
              onClick={() => void handleSend()}
              disabled={!value.trim() || disabled || sending || isStreaming}
              startIcon={sending || isStreaming ? <CircularProgress size={16} color="inherit" /> : <SendRoundedIcon />}
            >
              Send
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
}
