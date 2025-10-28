import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Button,
    Container,
    Typography,
    useTheme,
    Grid,
    Stack,
    Icon
} from '@mui/material';
import { useTheme as useAppTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';

export default function LandingPage() {
    const navigate = useNavigate();
    const muiTheme = useTheme();
    const { themeName } = useAppTheme();
    const { token } = useAuth();
    const isAuthenticated = Boolean(token);

    const features = [
        {
            title: 'Creación Manual',
            description: 'Crea tus flashcards para material de estudio muy específico',
            icon: 'edit'
        },
        {
            title: 'Generación con IA',
            description: 'Nuestra IA crea flashcards para ti basadas en tus notas o documentos',
            icon: 'smart_toy'
        },
        {
            title: 'Seguimiento de Progreso',
            description: 'Visualiza tu avance y monitorea tu proceso de aprendizaje con estadísticas',
            icon: 'insights'
        },
        {
            title: 'Estudio Personal',
            description: 'Tu mazo, tus reglas. Estudia como mejor te convenga',
            icon: 'person'
        }
    ];

    return (
        <Box className="font-display">
            {/* Header */}
            <Box
                component="header"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    bgcolor: 'background.default',
                    borderBottom: 1,
                    borderColor: 'divider',
                    backdropFilter: 'blur(8px)'
                }}
            >
                <Container maxWidth="lg">
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            py: 2
                        }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                            <Box sx={{ color: 'primary.main', width: 24, height: 24 }}>
                                <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                                    <path
                                        d="M39.5563 34.1455V13.8546C39.5563 15.708 36.8773 17.3437 32.7927 18.3189C30.2914 18.916 27.263 19.2655 24 19.2655C20.737 19.2655 17.7086 18.916 15.2073 18.3189C11.1227 17.3437 8.44365 15.708 8.44365 13.8546V34.1455C8.44365 35.9988 11.1227 37.6346 15.2073 38.6098C17.7086 39.2069 20.737 39.5564 24 39.5564C27.263 39.5564 30.2914 39.2069 32.7927 38.6098C36.8773 37.6346 39.5563 35.9988 39.5563 34.1455Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        clipRule="evenodd"
                                        d="M10.4485 13.8519C10.4749 13.9271 10.6203 14.246 11.379 14.7361C12.298 15.3298 13.7492 15.9145 15.6717 16.3735C18.0007 16.9296 20.8712 17.2655 24 17.2655C27.1288 17.2655 29.9993 16.9296 32.3283 16.3735C34.2508 15.9145 35.702 15.3298 36.621 14.7361C37.3796 14.246 37.5251 13.9271 37.5515 13.8519C37.5287 13.7876 37.4333 13.5973 37.0635 13.2931C36.5266 12.8516 35.6288 12.3647 34.343 11.9175C31.79 11.0295 28.1333 10.4437 24 10.4437C19.8667 10.4437 16.2099 11.0295 13.657 11.9175C12.3712 12.3647 11.4734 12.8516 10.9365 13.2931C10.5667 13.5973 10.4713 13.7876 10.4485 13.8519ZM37.5563 18.7877C36.3176 19.3925 34.8502 19.8839 33.2571 20.2642C30.5836 20.9025 27.3973 21.2655 24 21.2655C20.6027 21.2655 17.4164 20.9025 14.7429 20.2642C13.1498 19.8839 11.6824 19.3925 10.4436 18.7877V34.1275C10.4515 34.1545 10.5427 34.4867 11.379 35.027C12.298 35.6207 13.7492 36.2054 15.6717 36.6644C18.0007 37.2205 20.8712 37.5564 24 37.5564C27.1288 37.5564 29.9993 37.2205 32.3283 36.6644C34.2508 36.2054 35.702 35.6207 36.621 35.027C37.4573 34.4867 37.5485 34.1546 37.5563 34.1275V18.7877ZM41.5563 13.8546V34.1455C41.5563 36.1078 40.158 37.5042 38.7915 38.3869C37.3498 39.3182 35.4192 40.0389 33.2571 40.5551C30.5836 41.1934 27.3973 41.5564 24 41.5564C20.6027 41.5564 17.4164 41.1934 14.7429 40.5551C12.5808 40.0389 10.6502 39.3182 9.20848 38.3869C7.84205 37.5042 6.44365 36.1078 6.44365 34.1455L6.44365 13.8546C6.44365 12.2684 7.37223 11.0454 8.39581 10.2036C9.43325 9.3505 10.8137 8.67141 12.343 8.13948C15.4203 7.06909 19.5418 6.44366 24 6.44366C28.4582 6.44366 32.5797 7.06909 35.657 8.13948C37.1863 8.67141 38.5667 9.3505 39.6042 10.2036C40.6278 11.0454 41.5563 12.2684 41.5563 13.8546Z"
                                        fill="currentColor"
                                        fillRule="evenodd"
                                    />
                                </svg>
                            </Box>
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 'bold',
                                    color: 'text.primary'
                                }}
                            >
                                ICards
                            </Typography>
                        </Box>
                        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 8 }}>
                            <Stack direction="row" spacing={4} alignItems="center">
                                {/* <Button
                                    color="inherit"
                                    sx={{
                                        textTransform: 'none',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Funcionalidades
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={{
                                        textTransform: 'none',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Precios
                                </Button>
                                <Button
                                    color="inherit"
                                    sx={{
                                        textTransform: 'none',
                                        '&:hover': { color: 'primary.main' }
                                    }}
                                >
                                    Nosotros
                                </Button> */}
                            </Stack>
                            {/* <Button
                                variant="contained"
                                color="primary"
                                onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
                                sx={{
                                    minWidth: 84,
                                    maxWidth: 480,
                                    px: 3,
                                    py: 1,
                                    textTransform: 'none',
                                    fontWeight: 'bold'
                                }}
                            >
                                {isAuthenticated ? 'Mis Decks' : 'Ingresar'}
                            </Button> */}
                        </Box>
                        <Box sx={{ display: { xs: 'block', md: 'none' } }}>
                            <Button color="inherit">
                                <Icon>menu</Icon>
                            </Button>
                        </Box>
                    </Box>
                </Container>
            </Box>

            {/* Hero Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 8 } }}>
                <Grid container spacing={6} alignItems="center">
                    <Grid item xs={12} md={6}>
                        <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                            <Typography
                                variant="h1"
                                sx={{
                                    fontSize: { xs: '2.5rem', sm: '3rem' },
                                    fontWeight: 900,
                                    letterSpacing: '-0.033em',
                                    mb: 2,
                                    color: 'text.primary'
                                }}
                            >
                                Estudia Inteligente, No Más Duro. El Futuro del Aprendizaje es Hoy.
                            </Typography>
                            <Typography
                                variant="h2"
                                sx={{
                                    fontSize: { xs: '1rem', sm: '1.25rem' },
                                    fontWeight: 'normal',
                                    color: 'text.secondary',
                                    mb: 4
                                }}
                            >
                                Crea flashcards al instante, manual o con IA. Nuestro sistema inteligente registra tu progreso
                                para que domines cualquier tema sin esfuerzo.
                            </Typography>
                            <Button
                                variant="contained"
                                color="primary"
                                size="large"
                                onClick={() => navigate(isAuthenticated ? '/home' : '/login')}
                                sx={{
                                    px: 4,
                                    py: 1.5,
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 'bold',
                                    alignSelf: { xs: 'center', md: 'flex-start' },
                                    '&:hover': {
                                        transform: 'scale(1.05)'
                                    }
                                }}
                            >
                                {isAuthenticated ? 'Ir a Mis Decks' : 'Crea tu primer mazo gratis'}
                            </Button>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box
                            sx={{
                                width: '100%',
                                aspectRatio: { xs: '1/1', sm: '16/9' },
                                borderRadius: 4,
                                overflow: 'hidden',
                                background: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuCTce_f256QvGSxIGHqQrFXj5bmFRS-t7QELNWhsU1gGrkE4sKTnTkpCG5MICiPNYa1YnCbr8dMxb2VKp5dfRuItzKxSM17tEM5_4qWvJg7Up7IIsow0881nTG-ved-ge_YfvcF6rKfWTUhfMTuMqwqhICUrGXIZPzBakIq8mY234EuqSfE09YiAiS331AclqvqO6wZVzR9dQUW-Jw1oEx2Ifw4VY-e-WoLkIRYZnr5OyGTGqDA1siBwomSFkJPcVoizjkdnuA_p9Hr") center/cover no-repeat`
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>

            {/* Features Section */}
            <Container maxWidth="lg" sx={{ py: { xs: 4, sm: 8 } }}>
                <Box sx={{ maxWidth: '3xl', mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            fontWeight: { xs: 'bold', sm: 900 },
                            letterSpacing: 'tight',
                            color: 'text.primary',
                            mb: 2
                        }}
                    >
                        Todo lo que necesitas para aprender
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            color: 'text.secondary'
                        }}
                    >
                        ICards te ofrece un conjunto de herramientas potentes para crear tus mazos de estudio y
                        monitorear tu aprendizaje.
                    </Typography>
                </Box>

                <Grid container spacing={4}>
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Box
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center'
                                }}
                            >
                                <Icon
                                    sx={{
                                        fontSize: '2rem',
                                        color: 'primary.main',
                                        mb: 2
                                    }}
                                >
                                    {feature.icon}
                                </Icon>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                        color: 'text.primary'
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary'
                                    }}
                                >
                                    {feature.description}
                                </Typography>
                            </Box>
                        </Grid>
                    ))}
                </Grid>
            </Container>
        </Box>
    );
}