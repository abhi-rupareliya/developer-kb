'use client';

import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, alpha, createTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { ReactNode, useMemo } from 'react';

// Design System Constants
const BRAND_PRIMARY = '#3b82f6'; // Modern Blue
const SUCCESS = '#10b981';
const WARNING = '#f59e0b';
const ERROR = '#ef4444';

// Semantic Tokens Mapping
const getDesignTokens = (mode: 'light' | 'dark') => ({
  palette: {
    mode,
    primary: {
      main: BRAND_PRIMARY,
      contrastText: '#ffffff',
    },
    success: { main: SUCCESS },
    warning: { main: WARNING },
    error: { main: ERROR },
    background: {
      default: mode === 'light' ? '#ffffff' : '#09090b',
      paper: mode === 'light' ? '#f9fafb' : '#18181b', // background.surface
    },
    text: {
      primary: mode === 'light' ? '#0f172a' : '#f8fafc',
      secondary: mode === 'light' ? '#475569' : '#94a3b8',
    },
    divider: mode === 'light' ? '#e5e7eb' : '#27272a', // border.default
  },
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: 14,
    h1: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '2rem' },
    h2: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.5rem' },
    h3: { fontWeight: 600, letterSpacing: '-0.02em', fontSize: '1.25rem' },
    h4: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1.125rem' },
    h5: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '1rem' },
    h6: { fontWeight: 600, letterSpacing: '-0.01em', fontSize: '0.875rem' },
    subtitle1: { fontWeight: 500, fontSize: '0.875rem' },
    body1: { fontSize: '0.875rem', lineHeight: 1.6 },
    body2: { fontSize: '0.875rem', lineHeight: 1.6 },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      fontSize: '0.875rem',
    },
    caption: {
      fontSize: '0.75rem',
      letterSpacing: '0.01em',
    },
  },
});

const getComponentOverrides = (mode: 'light' | 'dark') => ({
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        '*': {
          boxSizing: 'border-box',
          transition: 'background-color 150ms ease, border-color 150ms ease',
        },
        html: { height: '100%' },
        body: {
          minHeight: '100%',
          backgroundColor: mode === 'light' ? '#ffffff' : '#09090b',
          color: mode === 'light' ? '#0f172a' : '#f8fafc',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale',
        },
        '::-webkit-scrollbar': {
          width: 8,
          height: 8,
        },
        '::-webkit-scrollbar-thumb': {
          backgroundColor: mode === 'light' ? '#e5e7eb' : '#27272a',
          borderRadius: 4,
          '&:hover': {
            backgroundColor: mode === 'light' ? '#d1d5db' : '#3f3f46',
          },
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
          border: `1px solid ${mode === 'light' ? '#e5e7eb' : '#27272a'}`,
          borderRadius: 8,
        },
      },
    },
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: '6px 12px',
          fontWeight: 500,
        },
        containedPrimary: {
          '&:hover': {
            backgroundColor: alpha(BRAND_PRIMARY, 0.9),
          },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          padding: 8,
          transition: 'all 150ms ease',
          '&:hover': {
            backgroundColor: mode === 'light' ? '#f3f4f6' : '#27272a',
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundColor: mode === 'light' ? '#ffffff' : '#09090b',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: mode === 'light' ? '#d1d5db' : '#3f3f46',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderWidth: 1,
            borderColor: BRAND_PRIMARY,
          },
        },
        notchedOutline: {
          borderColor: mode === 'light' ? '#e5e7eb' : '#27272a',
          transition: 'border-color 150ms ease',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: mode === 'light' ? '#f3f4f6' : '#1e1e1e', // border.subtle
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          margin: '2px 0',
          padding: '6px 10px',
          fontSize: '0.8125rem', // 13px
          '&:hover': {
            backgroundColor: mode === 'light' ? '#f3f4f6' : '#18181b',
          },
          '&.Mui-selected': {
            backgroundColor: mode === 'light' ? '#f3f4f6' : '#18181b',
            color: BRAND_PRIMARY,
            '&:hover': {
              backgroundColor: mode === 'light' ? '#e5e7eb' : '#27272a',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontSize: '0.75rem',
          height: 24,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 36,
        },
        indicator: {
          height: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 36,
          fontSize: '0.8125rem',
          padding: '6px 12px',
          textTransform: 'none',
        },
      },
    },
  },
});

interface ThemeProviderWrapperProps {
  children: ReactNode;
}

export function ThemeProviderWrapper({ children }: ThemeProviderWrapperProps) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const mode = prefersDarkMode ? 'dark' : 'light';

  const theme = useMemo(() => {
    const tokens = getDesignTokens(mode);
    const overrides = getComponentOverrides(mode);
    return createTheme({
      ...tokens,
      ...overrides,
    });
  }, [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
}

