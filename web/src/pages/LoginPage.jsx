import React from 'react';
import { LoginForm } from '../components/loginPage/LoginForm';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';

export const LoginPage = () => {
  return (
    <Box>
      <LoginForm />
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          left: 0,
          right: 0,
          textAlign: 'center',
          p: 2,
        }}
      >
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
