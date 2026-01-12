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
    Card,
    Avatar,
    Paper
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import AddBoxIcon from '@mui/icons-material/AddBox';
import SchoolIcon from '@mui/icons-material/School';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import ApiIcon from '@mui/icons-material/Api';
import IntegrationInstructionsIcon from '@mui/icons-material/IntegrationInstructions';
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

    const testimonials = [
        {
            text: 'La generación de flashcards con IA es increíble. Me ahorra horas de trabajo y me permite enfocarme en lo que realmente importa: aprender.',
            name: 'Ana G.',
            role: 'Estudiante de Medicina',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQXBp6iSFwfFgiY95hYTW4ubWsUAz6-NzKorGZXnmlMmZkmGqMSRV26GKtcXVpY9wwUbmUA609b0EB4aLOpQwn0b_gkFzFENLuGk3Jxg40N8PXaKx5tLOhUXBBCpSwNq8gusXzQAhgdioXnweHsmH38XQT0jEyzacGJDF63iDTul1RETNymcNOVlL42mPKoT2E03pF9CWervJtGmJic4G5fohi6F0jHRoFIbM1pO4_9XG8d-i1qBr46l9Asxv3R2pBoDBboZhQrzMA',
        },
        {
            text: 'El sistema de seguimiento de progreso me mantiene motivado. Ver cómo mejoro día a día es la mejor recompensa. ¡Totalmente recomendado!',
            name: 'Carlos R.',
            role: 'Opositor',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC80ms12pLrCKoezpIZbEhju7Pxt_3umkHqrGVBAH0fwvbjr2lrWqrErjwN93g-A09HkWqgOr_8BsLfT1SaAnrHcfh7VbPetfUlCeLgmTkGPNtCq3A7kn8Z2jypzc4-EhZ1hWswAKwjzuPM0xdFf-fojeBYis3mHF0-ik66Pjs2QEq_COlXYupHR0_xotDwSoncCG7RCjAqLuNdgCYBefi012AadtcSNc5IeCuuAswCZv6MgzzMXVDR9tZ1JYGn3wsiMP0-ENRYW5uC',
        },
        {
            text: 'Por fin una app de flashcards sencilla y potente. Me encanta el diseño minimalista y que mis mazos sean privados. ¡Justo lo que necesitaba!',
            name: 'Laura M.',
            role: 'Estudiante de Idiomas',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDblOljALJJMb2t0NRjsTg-NRkrgGuJiQ4eXwHkN4f_M0HUC4ll9Lnh9c7STfjAGaSxrSo1GqMRTsre-jiA0yEJsNw9SI0OX1S9x0-zoL-eZvQVlKlv3jAZpeaAmrCMq4JbUAp1UkbbIv0ZiDL9w_Av66QNAQ0mCPqV4vVDdnhuXeh_0Ajfl8VpUTZ4mBLNxOJ0N2xqk3WxrwfwPqA5oZQUc7UNW4Y30H9WWUkL8HE6m6st4e1eHkmb5W6dqxVhtiMsw7sDOTvMxgxe',
        },
    ];
    const testimonios = [
        {
            text: '“La generación de flashcards con IA es increíble. Me ahorra horas de trabajo y me permite enfocarme en lo que realmente importa: aprender.”',
            name: 'Ana G.',
            role: 'Recluter',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQXBp6iSFwfFgiY95hYTW4ubWsUAz6-NzKorGZXnmlMmZkmGqMSRV26GKtcXVpY9wwUbmUA609b0EB4aLOpQwn0b_gkFzFENLuGk3Jxg40N8PXaKx5tLOhUXBBCpSwNq8gusXzQAhgdioXnweHsmH38XQT0jEyzacGJDF63iDTul1RETNymcNOVlL42mPKoT2E03pF9CWervJtGmJic4G5fohi6F0jHRoFIbM1pO4_9XG8d-i1qBr46l9Asxv3R2pBoDBboZhQrzMA',
        },
        {
            text: '“Esta bueno, estaria piola algo que deje responder antes de mostrar respuesta, capaz agregar n respuestas. y capaz algun runner que te deje ir automaticamente de flashcard en flashcard. Bastante bueno”',
            name: 'Ariel R.',
            role: 'Estudiante de Ingeniería',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC80ms12pLrCKoezpIZbEhju7Pxt_3umkHqrGVBAH0fwvbjr2lrWqrErjwN93g-A09HkWqgOr_8BsLfT1SaAnrHcfh7VbPetfUlCeLgmTkGPNtCq3A7kn8Z2jypzc4-EhZ1hWswAKwjzuPM0xdFf-fojeBYis3mHF0-ik66Pjs2QEq_COlXYupHR0_xotDwSoncCG7RCjAqLuNdgCYBefi012AadtcSNc5IeCuuAswCZv6MgzzMXVDR9tZ1JYGn3wsiMP0-ENRYW5uC',
        },
        {
            text: '“Por fin una app de flashcards sencilla y potente. Me encanta el diseño minimalista y que mis mazos sean privados. ¡Justo lo que necesitaba!”',
            name: 'Laura M.',
            role: 'Estudiante de Idiomas',
            img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDblOljALJJMb2t0NRjsTg-NRkrgGuJiQ4eXwHkN4f_M0HUC4ll9Lnh9c7STfjAGaSxrSo1GqMRTsre-jiA0yEJsNw9SI0OX1S9x0-zoL-eZvQVlKlv3jAZpeaAmrCMq4JbUAp1UkbbIv0ZiDL9w_Av66QNAQ0mCPqV4vVDdnhuXeh_0Ajfl8VpUTZ4mBLNxOJ0N2xqk3WxrwfwPqA5oZQUc7UNW4Y30H9WWUkL8HE6m6st4e1eHkmb5W6dqxVhtiMsw7sDOTvMxgxe',
        },
    ]

    return (
        <> <Container className="font-display">
            {/* Header */}
            <Box
                component="header"
                sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 50,
                    bgcolor: 'transparent',
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
                            <Button
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
                                {isAuthenticated ? 'Ir a Mis Decks' : 'Crea tu primer mazo gratis'}
                            </Button>
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
            <Grid container alignItems="center" justifyContent='center'
                sx={{
                    py: { xs: 6, sm: 8 },
                    textAlign: { xs: 'center', md: 'center', lg: 'left' }, // centra el texto en chico
                    flexWrap: { xs: "wrap", lg: "nowrap", xl: "nowrap" }
                }}
                spacing={1}
            >
                {/* Descripción */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    lg={5} // 👈 ocupa más espacio en pantallas grandes
                    xl={5}
                    order={{ xs: 2, md: 1 }}
                    sx={{
                        px: { xs: 2, sm: 4, md: 4, lg: 4, xl: 4 },
                        textAlign: { xs: 'center', md: 'left' },
                        alignItems: { xs: 'center', md: 'flex-start' },
                        maxWidth: { sm: '42rem', md: '52rem', lg: '52rem', xl: '51rem' }
                    }}
                >

                    <Typography
                        variant="h1"
                        sx={{
                            fontSize: { xs: '2.0rem', sm: '2.8rem', md: '2.8rem', lg: '3.5rem' },
                            fontWeight: 900,
                            letterSpacing: '-0.025em',
                            mb: 2,
                            color: 'text.primary',
                            alignItems: { xs: 'center', md: 'flex-start' },
                            maxWidth: { sm: '42rem', md: '45rem', lg: '52rem', xl: '50rem' }, // 👈 ajusta con el viewport
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

                            maxWidth: { sm: '42rem', md: '45rem', lg: '52rem' }, // 👈 igual que arriba
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
                    lg={6} // 👈 menos espacio en pantallas grandes
                    xl={6}
                    order={{ xs: 2, md: 2 }}
                    alignItems={{ xs: 'center', md: 'flex-start' }}
                >
                    <Box
                        component="img"
                        src="header-min.png"
                        alt="Hero Image"
                        height="auto"
                        maxWidth={{ xs: 250, sm: 320, md: 275, lg: 300, xl: 315 }}
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

            {/* Features Section */}
            <Container maxWidth="xl" sx={{
                py: { xs: 4, sm: 8 }

            }}
            >
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

            {/* How It Works Section */}
            <Grid
                container
                spacing={4}
                alignItems="center" justifyContent='center'
                sx={{
                    py: { xs: 8, sm: 12 },
                    textAlign: { xs: "center", md: "left" },
                    flexWrap: { xs: "wrap", lg: "nowrap", xl: "nowrap" }
                }}
            >
                {/* Texto */}
                <Grid
                    item
                    xs={12}
                    md={6}
                    sx={{
                        // display: "flex",
                        // flexDirection: "column",
                        // justifyContent: "center",
                        alignItems: { xs: "center", md: "flex-start" },

                    }}
                >
                    <Typography
                        variant="h2"
                        sx={{
                            fontSize: { xs: "2rem", sm: "2.2rem" },
                            fontWeight: 800,
                            color: "text.primary",
                            mb: 2,
                        }}
                    >
                        ¿Cómo funciona?
                    </Typography>

                    <Typography
                        sx={{
                            color: "text.secondary",
                            fontSize: { xs: "1rem", sm: "1.1rem" },
                            mb: 4,
                            maxWidth: 750,
                        }}
                    >
                        Comienza en solo unos simples pasos. Tu aprendizaje optimizado está
                        a minutos de distancia.
                    </Typography>

                    {/* Pasos */}
                    <Box sx={{ width: "100%", maxWidth: 750 }}>
                        {[
                            {
                                icon: <PersonAddIcon color="primary" />,
                                title: "Regístrate Gratis",
                                text: "Crea tu cuenta en segundos. No se requiere tarjeta de crédito.",
                            },
                            {
                                icon: <AddBoxIcon color="primary" />,
                                title: "Crea tus Flashcards",
                                text: "Elige entre creación manual o automática con IA para generar tus mazos de estudio.",
                            },
                            {
                                icon: <SchoolIcon color="primary" />,
                                title: "Empieza a Estudiar",
                                text: "Utiliza nuestro sistema de estudio inteligente y sigue tu progreso para dominar la materia.",
                            },
                        ].map((step, i) => (
                            <Box
                                key={i}
                                sx={{
                                    display: "flex",
                                    gap: 2,
                                    alignItems: "flex-start",
                                    justifyContent: { xs: "center", md: "flex-start" },
                                    mb: 3,
                                }}
                            >
                                <Box
                                    sx={{
                                        bgcolor: "#fff",
                                        borderRadius: "50%",
                                        p: 1,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        width: 40,
                                        height: 40,
                                        boxShadow: 1,
                                    }}
                                >
                                    {step.icon}
                                </Box>
                                <Box sx={{ maxWidth: 400 }}>
                                    <Typography
                                        variant="subtitle1"
                                        sx={{ fontWeight: "bold", color: "text.primary" }}
                                    >
                                        {step.title}
                                    </Typography>
                                    <Typography sx={{ color: "text.secondary" }}>
                                        {step.text}
                                    </Typography>
                                </Box>
                            </Box>
                        ))}
                    </Box>
                </Grid>

                {/* Imagen */}
                <Grid
                    item
                    xs={12}
                    md={6}
                >
                    <Box
                        component="img"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuBAw07KPjF6uaw4I_V-TtSOWCD75tDA1y3pMxsYN7GjybT1ZCmRkwaSQvDkwCPZyXohZ5PUeSdr_UBcLZiKLvcEIld-72wxnsJ9aw8qUMqJmDfjHakLBlXvVBeaCLy9Ly-HI7YruHrRXRwt_Bjn0gq-j1TUkpLjePM3Er-QqV1pXY2n6vd8is9qGTns62QGkFdZC6lr2Svaj5vJLHWa_nOtjt-a8gg-oE6j6-L5lS5xhkGJxHCWoRH4pdJoPPRxF_cDYuLgYaNa5OkB"
                        alt="Demostración del estudio inteligente"
                        sx={{
                            width: { xs: "90%", sm: "80%", md: "100%" },
                            // maxWidth: 500,
                            aspectRatio: "1 / 1",
                            objectFit: "cover",
                            borderRadius: 3,
                            boxShadow: 4,
                        }}
                    />
                </Grid>
            </Grid>

            {/* MCP Section */}
            <Container maxWidth="xl" sx={{
                py: { xs: 4, sm: 8 }
            }}
            >
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
                        MCP - Model Context Protocol
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
                        Integra ICards con herramientas de IA a través del Model Context Protocol.
                        Crea flashcards directamente desde cualquier IDE o aplicación que soporte MCP.
                    </Typography>
                </Box>

                <Grid container spacing={4} justifyContent="center" sx={{ mb: 8 }}>
                    {[
                        {
                            icon: <SmartToyIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
                            title: 'Creación Inteligente',
                            description: 'Genera flashcards automáticamente con IA, considerando el contexto completo de tu aprendizaje.'
                        },
                        {
                            icon: <ApiIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
                            title: 'Integración Nativa',
                            description: 'Funciona directamente en tus herramientas favoritas sin cambiar de aplicación.'
                        },
                        {
                            icon: <IntegrationInstructionsIcon sx={{ fontSize: '2rem', color: 'primary.main' }} />,
                            title: 'Flujo Unificado',
                            description: 'Mantén tu concentración creando tarjetas mientras estudias o investigas.'
                        }
                    ].map((mcpFeature, index) => (
                        <Grid item xs={12} sm={4} key={index} sx={{ display: 'flex' }}>
                            <Card
                                sx={{
                                    p: 4,
                                    width: '100%',
                                    display: 'flex',
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
                                <Box sx={{ mb: 2 }}>
                                    {mcpFeature.icon}
                                </Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        mb: 1,
                                        color: 'text.primary',
                                        fontWeight: 700,
                                    }}
                                >
                                    {mcpFeature.title}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: 'text.secondary',
                                        flexGrow: 1,
                                    }}
                                >
                                    {mcpFeature.description}
                                </Typography>
                            </Card>
                        </Grid>
                    ))}
                </Grid>

                {/* MCP Configuration */}
                <Box sx={{ mb: 8 }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            fontWeight: 700,
                            color: 'text.primary',
                            mb: 4,
                            textAlign: 'center'
                        }}
                    >
                        Configuración MCP
                    </Typography>

                    <Grid container spacing={4} justifyContent="center">
                        <Grid item xs={12} md={10}>
                            <Card sx={{ p: 4, borderRadius: 3, boxShadow: 3 }}>
                                <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'text.primary' }}>
                                    Configuración MCP
                                </Typography>

                                <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                                    Agrega esta configuración a tu archivo de configuración MCP (como <code>mcp.json</code>, <code>.cursor/mcp.json</code>, etc.) para integrar ICards con tu IDE:
                                </Typography>

                                {/* Instructions */}
                                <Box sx={{ mb: 4, p: 3, bgcolor: 'grey.800', borderRadius: 2, border: '1px solid', borderColor: 'grey.600' }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'white' }}>
                                        📋 Pasos de instalación:
                                    </Typography>
                                    <Box component="ol" sx={{ pl: 3, m: 0, '& li': { mb: 1, color: 'grey.200' } }}>
                                        <li>Instala MCP proxy: <code style={{ color: '#61dafb' }}>pip install mcp-proxy</code></li>
                                        <li>Crea/edita el archivo de configuración MCP en tu workspace (ej: <code style={{ color: '#61dafb' }}>mcp.json</code>, <code style={{ color: '#61dafb' }}>.cursor/mcp.json</code>)</li>
                                        <li>Agrega la configuración de abajo</li>
                                        <li>Obtén tu token JWT desde esta página (botón verde arriba)</li>
                                        <li>Reemplaza <code style={{ color: '#61dafb' }}>"tu_token_jwt_aqui"</code> con tu token real</li>
                                        <li>Reinicia tu IDE/editor para cargar la configuración</li>
                                    </Box>
                                </Box>

                                {/* JSON Configuration */}
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'text.primary' }}>
                                        📄 Archivo de configuración MCP
                                    </Typography>
                                </Box>

                                <Paper
                                    sx={{
                                        p: 3,
                                        bgcolor: 'grey.900',
                                        color: '#f8f8f2',
                                        borderRadius: 2,
                                        fontFamily: '"JetBrains Mono", "Fira Code", "Consolas", "Monaco", monospace',
                                        fontSize: '0.875rem',
                                        lineHeight: 1.6,
                                        position: 'relative',
                                        '&::before': {
                                            content: '""',
                                            position: 'absolute',
                                            top: 12,
                                            left: 12,
                                            width: 12,
                                            height: 12,
                                            borderRadius: '50%',
                                            bgcolor: '#ff5f56',
                                            boxShadow: '20px 0 #ffbd2e, 40px 0 #27ca3f'
                                        }
                                    }}
                                >
                                    <Box sx={{ mt: 2 }}>
                                        <Box component="pre" sx={{
                                            margin: 0,
                                            whiteSpace: 'pre-wrap',
                                            wordBreak: 'break-all'
                                        }}>
                                            {`{
  "icards": {
    "command": "uvx",
    "args": [
      "mcp-proxy",
      "-H",
      "Authorization",
      "tu_token_jwt_aqui",
      "https://icards.fun/flashcards/sse"
    ],
    "env": {},
    "restart": true
  }
}`}
                                        </Box>
                                    </Box>
                                </Paper>

                                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary', fontStyle: 'italic' }}>
                                    💡 <strong>Nota:</strong> Reemplaza <code>"tu_token_jwt_aqui"</code> con tu token JWT real obtenido arriba
                                </Typography>
                            </Card>
                        </Grid>
                    </Grid>
                </Box>

                {/* MCP How To Use */}
                <Box sx={{ textAlign: 'center' }}>
                    <Typography
                        variant="h3"
                        sx={{
                            fontSize: { xs: '1.5rem', sm: '2rem' },
                            fontWeight: 700,
                            color: 'text.primary',
                            mb: 4,
                        }}
                    >
                        ¿Cómo empezar?
                    </Typography>

                    <Grid container spacing={3} justifyContent="center">
                        {[
                            {
                                step: '1',
                                title: 'Instala MCP Proxy',
                                description: 'Ejecuta `pip install mcp-proxy` o usa `uvx mcp-proxy` para tener la herramienta disponible.'
                            },
                            {
                                step: '2',
                                title: 'Configura tu IDE',
                                description: 'Agrega la configuración MCP de arriba a tu archivo de configuración con tu token JWT.'
                            },
                            {
                                step: '3',
                                title: 'Reinicia tu IDE',
                                description: 'Reinicia tu IDE/editor para que cargue la nueva configuración MCP.'
                            }
                        ].map((step, index) => (
                            <Grid item xs={12} sm={4} key={index} sx={{ display: 'flex' }}>
                                <Box
                                    sx={{
                                        p: 3,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        width: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        textAlign: 'center',
                                    }}
                                >
                                    <Box
                                        sx={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: '50%',
                                            bgcolor: 'primary.main',
                                            color: 'primary.contrastText',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: 'bold',
                                            mb: 2,
                                        }}
                                    >
                                        {step.step}
                                    </Box>
                                    <Typography
                                        variant="h6"
                                        sx={{
                                            mb: 1,
                                            color: 'text.primary',
                                            fontWeight: 600,
                                        }}
                                    >
                                        {step.title}
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        sx={{
                                            color: 'text.secondary',
                                            flexGrow: 1,
                                        }}
                                    >
                                        {step.description}
                                    </Typography>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            </Container>

            {/* Testimonio Section */}
            <Box component="section" sx={{ py: { xs: 8, sm: 12 } }}>
                <Container maxWidth="xl">
                    <Box sx={{ textAlign: 'center', mb: 6 }}>
                        <Typography
                            variant="h2"
                            sx={{
                                fontSize: { xs: '2rem', sm: '2.2rem' },
                                fontWeight: 800,
                                color: 'text.primary',
                                mb: 2,
                            }}
                        >
                            Amado por estudiantes de todo el mundo
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', fontSize: { xs: '1rem', sm: '1.1rem' } }}>
                            Mira lo que dicen nuestros usuarios sobre cómo ICards ha mejorado su forma de estudiar.
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        {testimonios.map((t, i) => (
                            <Grid item xs={12} md={6} lg={4} key={i}>
                                <Box
                                    sx={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        gap: 2,
                                        p: 4,
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        borderRadius: 3,
                                        boxShadow: 1,
                                        bgcolor: 'background.paper',
                                        height: '100%',
                                    }}
                                >
                                    <Typography sx={{ color: 'text.primary', flexGrow: 1 }}>{t.text}</Typography>
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            pt: 2,
                                            borderTop: '1px solid',
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Avatar src={t.img} alt={t.name} sx={{ width: 40, height: 40 }} />
                                        <Box>
                                            <Typography sx={{ fontWeight: 'bold', color: 'text.primary' }}>{t.name}</Typography>
                                            <Typography sx={{ fontSize: '0.9rem', color: 'text.secondary' }}>{t.role}</Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            </Grid>
                        ))}
                    </Grid>
                </Container>
            </Box>
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
        </Container >
        </>

    );
}