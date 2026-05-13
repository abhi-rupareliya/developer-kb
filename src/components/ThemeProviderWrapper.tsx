'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, alpha, createTheme } from '@mui/material/styles';
import { ReactNode } from 'react';

const surface = '#f5f7fb';
const panel = '#ffffff';
const border = 'rgba(15, 23, 42, 0.10)';
const textPrimary = '#0f172a';
const textSecondary = '#475569';
const primary = '#2563eb';
const success = '#0f766e';
const warning = '#b45309';
const error = '#b91c1c';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: primary,
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#0f766e',
    },
    background: {
      default: surface,
      paper: panel,
    },
    text: {
      primary: textPrimary,
      secondary: textSecondary,
    },
    divider: border,
    success: {
      main: success,
    },
    warning: {
      main: warning,
    },
    error: {
      main: error,
    },
  },
  shape: {
    borderRadius: 4,
  },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    h1: { fontWeight: 700, letterSpacing: '-0.03em' },
    h2: { fontWeight: 700, letterSpacing: '-0.03em' },
    h3: { fontWeight: 700, letterSpacing: '-0.025em' },
    h4: { fontWeight: 650, letterSpacing: '-0.02em' },
    h5: { fontWeight: 650, letterSpacing: '-0.015em' },
    h6: { fontWeight: 650, letterSpacing: '-0.01em' },
    subtitle1: { fontWeight: 600 },
    body1: { lineHeight: 1.55 },
    body2: { lineHeight: 1.45 },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
    caption: {
      letterSpacing: '0.02em',
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
        },
        html: {
          height: '100%',
        },
        body: {
          minHeight: '100%',
          backgroundColor: surface,
          backgroundImage:
            'radial-gradient(circle at top left, rgba(37, 99, 235, 0.08), transparent 30%), radial-gradient(circle at top right, rgba(15, 118, 110, 0.06), transparent 24%)',
          color: textPrimary,
        },
        '#__next': {
          minHeight: '100vh',
        },
        '::selection': {
          backgroundColor: alpha(primary, 0.2),
        },
        '::-webkit-scrollbar': {
          width: 10,
          height: 10,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: 'rgba(100, 116, 139, 0.35)',
          borderRadius: 999,
          border: `2px solid ${surface}`,
        },
      },
    },
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: `1px solid ${border}`,
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          minHeight: 40,
          paddingInline: 16,
        },
        contained: {
          boxShadow: '0 8px 24px rgba(37, 99, 235, 0.16)',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 10,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          backgroundColor: panel,
        },
        notchedOutline: {
          borderColor: border,
        },
      },
    },
    MuiTextField: {
      defaultProps: {
        variant: 'outlined',
        size: 'small',
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 40,
        },
        indicator: {
          height: 3,
          borderRadius: 999,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 40,
          paddingTop: 10,
          paddingBottom: 10,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '6px 12px',
          transition: 'background-color 160ms ease, border-color 160ms ease, transform 160ms ease',
          '&.Mui-selected': {
            backgroundColor: alpha(primary, 0.08),
            borderColor: alpha(primary, 0.18),
          },
          '&:hover': {
            backgroundColor: alpha(primary, 0.05),
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 999,
          fontWeight: 600,
        },
        sizeSmall: {
          height: 24,
        },
      },
    },
  },
});

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}
