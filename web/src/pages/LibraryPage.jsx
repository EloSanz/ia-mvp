import React from 'react';
import {
  Container,
  Typography,
  Box,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  LibraryBooks as LibraryIcon,
  AutoAwesome as AIIcon
} from '@mui/icons-material';
import Navigation from '../components/Navigation';
import Breadcrumbs from '../components/Breadcrumbs';
import { useTheme as useMuiTheme } from '@mui/material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';

export default function LibraryPage() {
  const muiTheme = useMuiTheme();
  const { themeName } = useAppTheme();

  return (
    <>
      <Navigation />
      <Container
        maxWidth="lg"
        sx={{
          pt: 2,
          pb: 4,
          backgroundColor: muiTheme.palette.background.default,
          minHeight: 'calc(100vh - 64px)',
          position: 'relative',
          fontFamily: muiTheme.fontFamily
        }}
      >
        <Breadcrumbs />
        

        {/* Contenido centrado */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="70vh"
          textAlign="center"
          gap={4}
        >
          {/* Icono y título juntos */}
          <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
            <LibraryIcon sx={{ fontSize: 80, color: 'primary.main' }} />
            <Typography 
              variant="h3" 
              component="h1" 
              sx={{ 
                color: muiTheme.palette.text.primary, 
                fontWeight: 'bold',
                fontFamily: muiTheme.fontFamily
              }}
            >
              Biblioteca Comunitaria
            </Typography>
          </Box>

          {/* Banner mejorado */}
          <Alert 
            severity="info" 
            sx={{ 
              maxWidth: 500,
              width: '100%',
              backgroundColor: themeName === 'github' ? '#21262d' : undefined,
              border: themeName === 'github' ? '1px solid #30363d' : undefined,
              fontFamily: muiTheme.fontFamily,
              '& .MuiAlert-icon': {
                display: 'none' // Ocultar el icono del alert para evitar duplicación
              },
              '& .MuiAlert-message': {
                color: themeName === 'github' ? '#ffffff' : undefined,
                fontWeight: themeName === 'github' ? '500' : undefined,
                fontFamily: muiTheme.fontFamily,
                width: '100%'
              }
            }}
          >
            <AlertTitle sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: 1,
              fontSize: '1.1rem',
              fontWeight: 'bold'
            }}>
              <AIIcon sx={{ fontSize: 20 }} />
              🚧 Funcionalidad en Desarrollo
            </AlertTitle>
            <Typography variant="body1" sx={{ mt: 1, textAlign: 'center' }}>
              Pronto podrás publicar y compartir tus decks con la comunidad.
            </Typography>
          </Alert>
        </Box>
      </Container>
    </>
  );
}
