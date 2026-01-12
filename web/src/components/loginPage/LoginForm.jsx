import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import {
  Box,
  Button,
  TextField,
  Typography,
  Container,
  Alert,
  Link,
  InputAdornment,
  IconButton,
  Grid
} from '@mui/material';
import RemoveRedEye from '@mui/icons-material/RemoveRedEye';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import StyleIcon from '@mui/icons-material/Style';
import { useTheme } from '@mui/material/styles';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [testName, setTestName] = useState('');
  const [testError, setTestError] = useState('');
  const { login, testLogin } = useAuth();
  const navigate = useNavigate();
  const theme = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const result = await login(username, password);
    if (result.success) {
      navigate('/home');
    } else {
      setError(result.error);
    }
  };

  const handleTestLogin = async () => {
    setError('');
    setTestError('');

    if (!testName.trim()) {
      setTestError('Ingresa un nombre para continuar');
      return;
    }

    const result = await testLogin(testName.trim());
    if (result.success) {
      navigate('/home');
    } else {
      setTestError(result.error);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    // <Grid container sx={{ minHeight: '100vh' }}>
    // {/* Login Form */}
    <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
      <Box
        sx={{
          // Full viewport height so the form centers vertically on the page
          minHeight: '100vh',
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: (theme) =>
            theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
        }}
      >
        <Container maxWidth="sm" sx={{ maxWidth: { xs: '100%', sm: '450px' } }}>
          <Box
            sx={{
              backgroundColor: 'background.paper',
              borderRadius: 2,
              p: 4,
              boxShadow: (theme) =>
                theme.palette.mode === 'dark'
                  ? '0 8px 32px rgba(0, 0, 0, 0.24)'
                  : '0 8px 32px rgba(0, 0, 0, 0.12)',
              maxWidth: '100%',
              margin: '0 auto'
            }}
          >
            {/* Logo */}
            <Box sx={{ mb: 6, display: 'flex', justifyContent: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <StyleIcon sx={{ color: 'primary.main', fontSize: '2.5rem' }} />
                <Typography
                  variant="h4"
                  sx={{ fontWeight: 'bold', color: 'text.primary' }}
                >
                  ICards
                </Typography>
              </Box>
            </Box>

            {/* Header */}
            <Box sx={{ mb: 6, textAlign: 'center' }}>
              <Typography
                variant="h1"
                sx={{ fontSize: '2rem', fontWeight: 'bold', color: 'text.primary', mb: 1 }}
              >
                Bienvenido de Nuevo
              </Typography>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Ingresa tus credenciales para acceder a tu panel.
              </Typography>
            </Box>

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit}>
              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box sx={{ mb: 3 }}>
                <Typography
                  variant="subtitle1"
                  sx={{ mb: 1, fontWeight: 500, color: 'text.primary' }}
                >
                  Correo Electrónico
                </Typography>
                <TextField
                  required
                  fullWidth
                  placeholder="Ingresa tu correo"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '56px',
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 500, color: 'text.primary' }}
                  >
                    Contraseña
                  </Typography>
                  {/* <Link
                    component={RouterLink}
                    to="/forgot-password"
                    sx={{
                      color: 'primary.main',
                      textDecoration: 'none',
                      '&:hover': { textDecoration: 'underline' }
                    }}
                  >
                    ¿Olvidaste tu contraseña?
                  </Link> */}
                </Box>
                <TextField
                  required
                  fullWidth
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          edge="end"
                        >
                          {showPassword ? <RemoveRedEye fontSize="small" /> : <VisibilityOff fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    )
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      height: '56px',
                      bgcolor: 'background.paper'
                    }
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                sx={{
                  height: '56px',
                  textTransform: 'none',
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Iniciar Sesión
              </Button>

              <Box sx={{ mt: 2, mb: 2, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  ¿No tienes una cuenta?{' '}
                  <Link component={RouterLink} to="/register" color="primary" sx={{ fontWeight: 500 }}>
                    Regístrate aquí
                  </Link>
                </Typography>
              </Box>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 500 }}>
                  O entra como <strong>usuario de prueba</strong>
                </Typography>

                <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
                  No necesitas registrarte. Algunas funciones de IA estarán deshabilitadas,
                  pero podrás crear decks y cartas manualmente o desde archivos.
                </Typography>

                <TextField
                  fullWidth
                  label="Tu nombre"
                  placeholder="Ingresa un nombre para identificar tu sesión"
                  value={testName}
                  onChange={(e) => setTestName(e.target.value)}
                  sx={{ mb: 2 }}
                />

                {testError && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {testError}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="outlined"
                  color="secondary"
                  onClick={handleTestLogin}
                >
                  Entrar como usuario de prueba
                </Button>
              </Box>

            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};
