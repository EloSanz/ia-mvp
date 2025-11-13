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
  ListItemIcon,
  Drawer,
  useMediaQuery,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import {
  Home as HomeIcon,
  Menu as MenuIcon,
  School as SchoolIcon,
  Sync as SyncIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
  Code as GithubIcon,
  Psychology as StudyIcon,
  LibraryBooks as LibraryIcon,
  Keyboard as KeyboardIcon
} from '@mui/icons-material';

import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigation } from '../hooks/useNavigation';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { themeName, setTheme } = useTheme();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [showShortcuts, setShowShortcuts] = React.useState(false);

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

  // Cerrar shortcuts al hacer click fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showShortcuts && !event.target.closest('[data-shortcuts-container]')) {
        setShowShortcuts(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showShortcuts]);

  // Usar el hook de navegación inteligente
  const { isOnHome, navigationButtonText, navigationButtonAction } = useNavigation();


  // Drawer (mobile)
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const toggleDrawer = (open) => () => setDrawerOpen(open);

  // Detectar si es pantalla chica
  const isMobile = useMediaQuery((theme) => theme.breakpoints.down('md'));

  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Box
          display="flex"
          alignItems="center"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') navigate('/');
          }}
          aria-label="Ir al inicio"
        >
          <SchoolIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div">
            ICard - estudia inteligente
          </Typography>
          <Chip label="Beta" size="small" color="secondary" sx={{ ml: 2 }} />
        </Box>


        {/* --- Versión escritorio --- */}
        {!isMobile && (
          <Box>
            {!isOnHome && (
              <Button
                color="inherit"
                startIcon={<HomeIcon />}
                onClick={navigationButtonAction}
                sx={{ mr: 2 }}
              >
                {navigationButtonText}
              </Button>
            )}

            {/* Comentado para no mostrar el botón de sincronización ya que hoy en dia no esta haciendo nada. */}
            {/*
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
          */}

            <Button
              color="inherit"
              startIcon={<StudyIcon />}
              onClick={() => navigate('/study')}
              sx={{ mr: 2 }}
            >
              Estudiar
            </Button>

            <Button
              color="inherit"
              startIcon={<LibraryIcon />}
              onClick={() => navigate('/library')}
              sx={{ mr: 2 }}
            >
              Biblioteca
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
          </Box>)}
        {/* --- Versión móvil --- */}
        {isMobile && (
          <>
            <IconButton
              color="inherit"
              onClick={toggleDrawer(true)}
              edge="end"
              aria-label="menu"
            >
              <MenuIcon />  {/* ← este es el ícono hamburguesa */}
            </IconButton>

            <Drawer anchor="right" open={drawerOpen} onClose={toggleDrawer(false)}>
              <Box sx={{ width: 250, p: 2 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Menú
                </Typography>
                <Divider />
                <List>
                  {!isOnHome && (
                    <ListItem disablePadding>
                      <ListItemButton onClick={navigationButtonAction}>
                        <HomeIcon sx={{ mr: 1 }} /> <ListItemText primary={navigationButtonText} />
                      </ListItemButton>
                    </ListItem>
                  )}
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/study')}>
                      <StudyIcon sx={{ mr: 1 }} /> <ListItemText primary="Estudiar" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => navigate('/library')}>
                      <LibraryIcon sx={{ mr: 1 }} /> <ListItemText primary="Biblioteca" />
                    </ListItemButton>
                  </ListItem>
                </List>

                <Divider sx={{ my: 1 }} />

                {/* Temas */}
                <List>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleThemeChange('light')}>
                      <LightModeIcon sx={{ mr: 1 }} /> <ListItemText primary="Claro" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleThemeChange('dark')}>
                      <DarkModeIcon sx={{ mr: 1 }} /> <ListItemText primary="Oscuro" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => handleThemeChange('github')}>
                      <GithubIcon sx={{ mr: 1 }} /> <ListItemText primary="GitHub" />
                    </ListItemButton>
                  </ListItem>
                </List>

                <Divider sx={{ my: 1 }} />

                {/* Usuario */}
                {user && (
                  <>
                    <ListItem disablePadding>
                      <ListItemButton>
                        <PersonIcon sx={{ mr: 1 }} /> <ListItemText primary={user.username} />
                      </ListItemButton>
                    </ListItem>
                    <ListItem disablePadding>
                      <ListItemButton
                        onClick={() => {
                          logout();
                          navigate('/login');
                        }}
                      >
                        <LogoutIcon sx={{ mr: 1 }} /> <ListItemText primary="Cerrar sesión" />
                      </ListItemButton>
                    </ListItem>
                  </>
                )}
              </Box>
            </Drawer>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navigation;
