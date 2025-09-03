import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, Chip, IconButton, Tooltip } from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Sync as SyncIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode, toggleTheme } = useTheme();

  const isHome = location.pathname === '/';

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            IA Flashcards MVP
          </Typography>
          <Chip label="Beta" size="small" color="secondary" sx={{ ml: 2 }} />
        </Box>

        <Box>
          {!isHome && (
            <Button
              color="inherit"
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{ mr: 2 }}
            >
              Inicio
            </Button>
          )}

          <Button
            color="inherit"
            startIcon={<SyncIcon />}
            onClick={() => {
              // Aquí podríamos agregar funcionalidad de sincronización
              console.log('Sincronización con Anki');
            }}
            sx={{ mr: 1 }}
          >
            Sincronizar
          </Button>

          <Tooltip title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}>
            <IconButton color="inherit" onClick={toggleTheme} size="large">
              {isDarkMode ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
