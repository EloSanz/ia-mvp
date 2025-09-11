import React from 'react';
import { LoginForm } from '../components/LoginForm';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';

export const LoginPage = () => {
  return (
    <Box>
      <LoginForm />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          ¿No tienes una cuenta?{' '}
          <Link component={RouterLink} to="/register">
            Regístrate aquí
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
