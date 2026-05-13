'use client';

import { Alert, Snackbar } from '@mui/material';

type AppSnackbarProps = {
  open: boolean;
  message: string;
  severity?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
};

export function AppSnackbar({ open, message, severity = 'info', onClose }: AppSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={3500}
      onClose={onClose}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} variant="filled" sx={{ alignItems: 'center' }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
