import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon
} from '@mui/material';
import {
  Home as HomeIcon,
  School as SchoolIcon,
  Sync as SyncIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Code as GithubIcon
} from '@mui/icons-material';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeName, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleThemeChange = (name) => {
    setTheme(name);
    handleMenuClose();
  };
  const { user, logout } = useAuth();

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
              // TODO: Implementar sincronización con Anki
            }}
          >
            Sincronizar
          </Button>

          <Tooltip title="Seleccionar tema">
            <IconButton color="inherit" onClick={handleMenuOpen} size="large">
              {themeName === 'light' ? (
                <LightModeIcon />
              ) : themeName === 'dark' ? (
                <DarkModeIcon />
              ) : (
                <GithubIcon />
              )}
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <MenuItem selected={themeName === 'light'} onClick={() => handleThemeChange('light')}>
              <ListItemIcon>
                <LightModeIcon fontSize="small" />
              </ListItemIcon>
              Claro
            </MenuItem>
            <MenuItem selected={themeName === 'dark'} onClick={() => handleThemeChange('dark')}>
              <ListItemIcon>
                <DarkModeIcon fontSize="small" />
              </ListItemIcon>
              Oscuro
            </MenuItem>
            <MenuItem selected={themeName === 'github'} onClick={() => handleThemeChange('github')}>
              <ListItemIcon>
                <GithubIcon fontSize="small" />
              </ListItemIcon>
              GitHub
            </MenuItem>
            <MenuItem selected={themeName === 'tokyo'} onClick={() => handleThemeChange('tokyo')}>
              <ListItemIcon>
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #00eaff 60%, #ff00cc 100%)',
                    border: '1px solid #222'
                  }}
                />{' '}
              </ListItemIcon>
              Tokyo
            </MenuItem>
            <MenuItem selected={themeName === 'kyoto'} onClick={() => handleThemeChange('kyoto')}>
              <ListItemIcon>
                <span
                  style={{
                    display: 'inline-block',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e573a7 60%, #f7cac9 100%)',
                    border: '1px solid #f7cac9'
                  }}
                />{' '}
              </ListItemIcon>
              Kyoto
            </MenuItem>
          </Menu>

          {user && (
            <>
              <Tooltip title={user.username}>
                <IconButton color="inherit" size="large">
                  <PersonIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Cerrar sesión">
                <IconButton
                  color="inherit"
                  onClick={() => {
                    logout();
                    navigate('/login');
                  }}
                  size="large"
                >
                  <LogoutIcon />
                </IconButton>
              </Tooltip>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
