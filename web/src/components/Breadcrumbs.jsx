/**
 * Breadcrumbs Component
 *
 * Componente de navegación breadcrumbs para mostrar el camino actual
 * Proporciona navegación contextual inteligente
 */

import React from 'react';
import { Box, Breadcrumbs as MuiBreadcrumbs, Link, Typography, Chip } from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  School as SchoolIcon,
  Psychology as StudyIcon
} from '@mui/icons-material';
import { useNavigation } from '../hooks/useNavigation';

const Breadcrumbs = ({ showOnHome = false, deckName = null }) => {
  const { getBreadcrumbItems, isOnHome } = useNavigation();
  const breadcrumbs = getBreadcrumbItems(deckName);

  // Si estamos en home y no queremos mostrar breadcrumbs, no renderizar
  if (isOnHome && !showOnHome) {
    return null;
  }

  // Si no hay breadcrumbs, no renderizar
  if (breadcrumbs.length === 0) {
    return null;
  }

  const getIconForPath = (path) => {
    if (path === '/') return <HomeIcon fontSize="small" />;
    if (path.startsWith('/decks/')) return <SchoolIcon fontSize="small" />;
    if (path.startsWith('/study')) return <StudyIcon fontSize="small" />;
    return null;
  };

  return (
    <Box sx={{ mb: 2 }}>
      <MuiBreadcrumbs separator={<NavigateNextIcon fontSize="small" />} aria-label="breadcrumb">
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;
          const hasClickHandler = item.onClick && typeof item.onClick === 'function';

          // Si es el último item Y no tiene click handler, mostrarlo como texto
          if (isLast && !hasClickHandler) {
            return (
              <Box key={item.path} display="flex" alignItems="center" gap={0.5}>
                {getIconForPath(item.path)}
                <Typography color="text.primary" variant="body2" fontWeight={500}>
                  {item.label}
                </Typography>
              </Box>
            );
          }

          // Si tiene click handler (incluso si es el último), mostrarlo como link
          return (
            <Link
              key={item.path}
              component="button"
              variant="body2"
              onClick={item.onClick}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline'
                }
              }}
            >
              {getIconForPath(item.path)}
              {item.label}
            </Link>
          );
        })}
      </MuiBreadcrumbs>
    </Box>
  );
};

export default Breadcrumbs;
