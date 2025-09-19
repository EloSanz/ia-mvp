import React from 'react';
import { RegisterForm } from '../components/RegisterForm';
import { Link as RouterLink } from 'react-router-dom';
import { Box, Link, Typography } from '@mui/material';

export const RegisterPage = () => {
  return (
    <Box>
      <RegisterForm />
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2">
          ¿Ya tienes una cuenta?{' '}
          <Link component={RouterLink} to="/login">
            Inicia sesión aquí
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};
