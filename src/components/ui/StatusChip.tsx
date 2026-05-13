'use client';

import { Chip, type ChipProps } from '@mui/material';

type StatusChipProps = ChipProps & {
  status?: 'success' | 'warning' | 'error' | 'info' | 'default';
};

export function StatusChip({ status = 'default', ...props }: StatusChipProps) {
  const color = status === 'default' ? undefined : status;
  return <Chip {...props} color={color as ChipProps['color']} size="small" variant={status === 'default' ? 'outlined' : 'filled'} />;
}
