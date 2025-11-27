import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';

export const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

const kyotoTheme = Object.assign(
  createTheme({
    palette: {
      mode: 'light',
      primary: { main: '#e573a7', contrastText: '#ffffff' }, // Sakura pink
      secondary: { main: '#f7cac9', contrastText: '#6d4c41' }, // Soft pink
      background: {
        default: 'rgba(247, 202, 201, 0.7)', // Soft pink with transparency
        paper: 'rgba(255, 255, 255, 0.85)'
      },
      text: {
        primary: '#6d4c41', // Brownish for contrast
        secondary: '#a1887f'
      },
      icon: {
        main: '#6d4c41'
      },
      divider: '#f7cac9',
      action: {
        hover: 'rgba(247, 202, 201, 0.2)'
      }
    }
  }),
  {
    fontFamily: 'Sawarabi Mincho, Noto Serif JP, serif',
    customBackground: {
      image: '/src/assets/kyoto.png',
      blur: 4,
      opacity: 0.7,
      brightness: 1.08
    }
  }
);

const tokyoTheme = Object.assign(
  createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#00eaff', contrastText: '#000000' }, // Neon blue
      secondary: { main: '#ff00cc', contrastText: '#ffffff' }, // Neon pink
      background: {
        default: 'rgba(10, 20, 40, 0.85)',
        paper: 'rgba(30, 40, 60, 0.95)'
      },
      text: {
        primary: '#e0e0e0',
        secondary: '#b0b0b0'
      },
      icon: {
        main: '#00eaff'
      },
      divider: '#222',
      action: {
        hover: 'rgba(0, 234, 255, 0.08)'
      }
    }
  }),
  {
    fontFamily: 'M PLUS 1p, Noto Sans JP, sans-serif',
    customBackground: {
      image: '/src/assets/tokyo.png',
      blur: 1,
      opacity: 0.3,
      brightness: 1.08
    }
  }
);

const themes = {
  light: Object.assign(
    createTheme({
      palette: {
        mode: 'light',
        primary: { main: '#1976d2', contrastText: '#ffffff' },
        secondary: { main: '#9c27b0', contrastText: '#ffffff' },
        background: {
          default: '#f7f9fa',
          paper: '#fdfdfd'
        },
        divider: '#e0e0e0',
        action: {
          hover: '#f0f4f8'
        },
        text: {
          primary: '#222',
          secondary: '#444'
        },
        icon: {
          main: '#222'
        }
      }
    }),
    { fontFamily: 'Roboto, Arial, sans-serif' }
  ),
  dark: Object.assign(
    createTheme({
      palette: {
        mode: 'dark',
        primary: { main: '#90caf9', contrastText: '#000000' },
        secondary: { main: '#ce93d8', contrastText: '#000000' },
        background: { default: '#1e1e1e', paper: '#2d2d2d' },
        grey: { 800: '#333333', 900: '#1e1e1e' }
      }
    }),
    { fontFamily: 'Roboto, Arial, sans-serif' }
  ),
  github: createTheme({
    palette: {
      mode: 'dark',
      primary: { main: '#2ea44f', contrastText: '#ffffff' },
      secondary: { main: '#58a6ff', contrastText: '#000000' },
      background: { default: '#0d1117', paper: '#161b22' },
      text: { primary: '#c9d1d9', secondary: '#8b949e' }
    }
  }),
  tokyo: tokyoTheme,
  kyoto: kyotoTheme
};

export const ThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState(() => {
    const saved = localStorage.getItem('themeName');
    return saved || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeName', themeName);
  }, [themeName]);

  const setTheme = (name) => {
    setThemeName(name);
  };

  const theme = themes[themeName] || themes.dark || createTheme();

  // Pass themeName so components can use it for background image logic
  return (
    <ThemeContext.Provider value={{ themeName, setTheme, themes }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
