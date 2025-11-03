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
    Icon,
    Card
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

    const benefits = [
        {
            title: 'Estudio Personalizado',
            description: 'Adapta tus mazos a tus necesidades específicas y maximiza tu aprendizaje.'
        },
        {
            title: 'Acceso Multiplataforma',
            description: 'Estudia desde cualquier dispositivo, en cualquier momento.'
        },
        {
            title: 'Actualizaciones Constantes',
            description: 'Disfruta de nuevas funcionalidades y mejoras continuas.'
        }
    ];

    const faqs = [
        {
            question: '¿Es realmente gratis?',
            answer: 'Sí, puedes registrarte y crear tu primer mazo sin costo alguno.'
        },
        {
            question: '¿Cómo funciona la generación con IA?',
            answer: 'Nuestra IA analiza tus notas y documentos para crear flashcards precisas y útiles.'
        },
        {
            question: '¿Puedo compartir mis mazos?',
            answer: 'Por ahora, los mazos son privados y están diseñados para uso personal.'
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
                <Container maxWidth="xl">
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
            <Container maxWidth="xl" sx={{ py: { xs: 6, sm: 8 } }}>
                <Grid container spacing={6} alignItems="center"
                    sx={{
                        flexDirection: { xs: 'column', md: 'column', lg: 'row' }, // apilado en chico, en fila en grande
                        justifyContent: { xs: 'center', md: 'center', lg: 'space-between' },
                        textAlign: { xs: 'center', md: 'center', lg: 'left' }, // centra el texto en chico
                    }}
                >
                    {/* Descripción */}
                    <Grid
                        item
                        xs={12}
                        md={7}
                        lg={9} // 👈 ocupa más espacio en pantallas grandes
                        order={{ xs: 2, md: 1 }}
                        sx={{
                            textAlign: { xs: 'center', md: 'left' },
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: { xs: 'center', md: 'flex-start' },
                        }}
                    >
                        <Typography
                            variant="h1"
                            sx={{
                                fontSize: { xs: '2.2rem', sm: '2.8rem', md: '3.2rem', lg: '3.5rem' },
                                fontWeight: 900,
                                letterSpacing: '-0.025em',
                                mb: 2,
                                color: 'text.primary',
                                maxWidth: { xs: '90%', sm: '80%', md: '700px', lg: '850px' }, // 👈 ajusta con el viewport
                            }}
                        >
                            Estudia Inteligente, No Más Duro. El Futuro del Aprendizaje es Hoy.
                        </Typography>

                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                                color: 'text.secondary',
                                mb: 4,
                                maxWidth: { xs: '90%', sm: '80%', md: '700px', lg: '800px' }, // 👈 igual que arriba
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
                                '&:hover': { transform: 'scale(1.05)' },
                            }}
                        >
                            {isAuthenticated ? 'Ir a Mis Decks' : 'Crea tu primer mazo gratis'}
                        </Button>
                    </Grid>

                    {/* Imagen */}
                    <Grid
                        item
                        xs={12}
                        md={5}
                        lg={3} // 👈 menos espacio en pantallas grandes
                        order={{ xs: 2, md: 2 }}
                        alignItems={{ xs: 'center', md: 'flex-start' }}
                    >
                        <Box
                            component="img"
                            src="header.png"
                            alt="Hero Image"
                            height="auto"
                            maxWidth={{ xs: 300, md: 400, lg: 480 }}
                            maxHeight="400"
                            sx={{
                                borderRadius: 4,
                                boxShadow: 3,
                                alignContent: 'center',
                                justifyContent: 'center',
                                display: 'flex',
                                margin: '0 auto',
                            }}
                        />
                    </Grid>
                </Grid>
            </Container>

            {/* Features Section */}
            <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 8 } }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 6 }}>
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: '2rem', sm: '2.5rem' },
                            fontWeight: { xs: 'bold', sm: 900 },
                            letterSpacing: 'tight',
                            color: 'text.primary',
                            mb: 2,
                        }}
                    >
                        Todo lo que necesitas para aprender
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            color: 'text.secondary',
                            maxWidth: '60rem',
                            mx: { xs: 'auto', md: 0 },
                        }}
                    >
                        ICards te ofrece un conjunto de herramientas potentes para crear tus mazos de estudio y
                        monitorear tu aprendizaje.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {features.map((feature, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    p: 4,
                                    height: '100%',
                                    display: 'flex',
                                    maxWidth: 345,
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    boxShadow: 3,
                                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                                    '&:hover': {
                                        transform: 'translateY(-6px)',
                                        boxShadow: 6,
                                    },
                                }}
                            >
                                <Icon
                                    sx={{
                                        fontSize: '2rem',
                                        color: 'primary.main',
                                        mb: 2,
                                    }}
                                >
                                    {feature.icon}
                                </Icon>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                        color: 'text.primary',
                                        fontWeight: 700,
                                    }}
                                >
                                    {feature.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                    }}
                                >
                                    {feature.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Container>

            {/* Benefits Section */}
            <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 8 } }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 6 }}>
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
                        Beneficios de Usar ICards
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            color: 'text.secondary'
                        }}
                    >
                        Descubre las ventajas de optimizar tu aprendizaje con nuestras herramientas.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {benefits.map((benefit, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card >
                                <Box
                                    sx={{
                                        p: 4,
                                        maxWidth: '30rem',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                        borderRadius: 4,
                                        boxShadow: 3,
                                    }}
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1,
                                            color: 'text.primary',
                                            fontWeight: 'medium'
                                        }}
                                    >
                                        {benefit.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary'
                                        }}
                                    >
                                        {benefit.description}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                    ))}
                </Grid>
            </Container>


            {/* FAQs Section */}

            <Container maxWidth="xl" sx={{ py: { xs: 4, sm: 8 } }}>
                <Box sx={{ textAlign: { xs: 'center', md: 'left' }, mb: 6 }}>
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
                        Preguntas Frecuentes
                    </Typography>
                    <Typography
                        variant="body1"
                        sx={{
                            fontSize: { xs: '1rem', sm: '1.125rem' },
                            color: 'text.secondary'
                        }}
                    >
                        Aquí tienes algunas preguntas comunes sobre ICards y nuestras respuestas.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center">
                    {faqs.map((faq, index) => (
                        <Grid item xs={12} sm={6} md={3} key={index}>
                            <Card
                                sx={{
                                    p: 4,

                                    maxWidth: '30rem',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    textAlign: 'center',
                                    borderRadius: 4,
                                    boxShadow: 3,
                                }}
                            >
                                <Box
                                >
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1,
                                            color: 'text.primary',
                                            fontWeight: 'medium'
                                        }}
                                    >
                                        {faq.question}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary'
                                        }}
                                    >
                                        {faq.answer}
                                    </Typography>
                                </Box>
                            </Card>
                        </Grid>

                    ))}
                </Grid>
            </Container>

            {/* Footer */}
            <Box
                component="footer"
                sx={{
                    py: 4,
                    bgcolor: 'background.paper',
                    borderTop: 1,
                    borderColor: 'divider'
                }}
            >
                <Container maxWidth="lg">
                    <Typography
                        variant="body2"
                        sx={{
                            color: 'text.secondary',
                            textAlign: 'center'
                        }}
                    >
                        © 2025 ICards. Todos los derechos reservados.
                    </Typography>
                </Container>
            </Box>
        </Box>
    );
}