'use client';

import { Box, Typography, Container, Paper, Avatar, Grid, Button, IconButton, Stack } from '@mui/material';
import { useTranslations } from 'next-intl';
import { motion } from 'framer-motion';
import EmailIcon from '@mui/icons-material/Email';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import GitHubIcon from '@mui/icons-material/GitHub';
import WorkIcon from '@mui/icons-material/Work';
import SchoolIcon from '@mui/icons-material/School';
import LanguageIcon from '@mui/icons-material/Language';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

export default function AboutPage() {
    const t = useTranslations('about');

    return (
        <Container maxWidth="md" sx={{ py: 8 }}>
            <Stack spacing={6}>
                {/* App Section */}
                <MotionBox
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <MotionPaper
                        elevation={3}
                        sx={{
                            p: 6,
                            borderRadius: 4,
                            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0.1) 100%)',
                            border: '1px solid rgba(25, 118, 210, 0.1)',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                    >
                        <SchoolIcon sx={{ position: 'absolute', right: -20, top: -20, fontSize: 150, opacity: 0.05, transform: 'rotate(-15deg)' }} />
                        <Typography variant="h3" component="h1" gutterBottom fontWeight="bold" color="primary">
                            {t('title')}
                        </Typography>
                        <Typography variant="h6" color="text.secondary" sx={{ lineHeight: 1.8, maxWidth: '80%' }}>
                            {t('description')}
                        </Typography>
                    </MotionPaper>
                </MotionBox>

                {/* Creator Section */}
                <Grid container spacing={4} alignItems="stretch">
                    <Grid item xs={12} md={5}>
                        <MotionPaper
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            elevation={3}
                            sx={{
                                p: 4,
                                height: '100%',
                                borderRadius: 4,
                                textAlign: 'center',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <Avatar
                                sx={{
                                    width: 120,
                                    height: 120,
                                    mb: 3,
                                    bgcolor: 'primary.main',
                                    fontSize: '3rem',
                                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                                }}
                            >
                                AL
                            </Avatar>
                            <Typography variant="h5" fontWeight="bold" gutterBottom>
                                {t('creator_name')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" gutterBottom>
                                Software Engineer & AI Specialist
                            </Typography>
                            <Stack direction="row" spacing={1} mt={2}>
                                <IconButton color="primary" onClick={() => window.location.href = `mailto:${t('email')}`}>
                                    <EmailIcon />
                                </IconButton>
                                <IconButton color="primary">
                                    <LinkedInIcon />
                                </IconButton>
                                <IconButton color="primary">
                                    <GitHubIcon />
                                </IconButton>
                            </Stack>
                        </MotionPaper>
                    </Grid>
                    <Grid item xs={12} md={7}>
                        <MotionPaper
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            elevation={3}
                            sx={{ p: 4, height: '100%', borderRadius: 4, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}
                        >
                            <Typography variant="h5" gutterBottom fontWeight="bold">
                                {t('creator_title')}
                            </Typography>
                            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                                {t('creator_description')}
                            </Typography>
                            <Button
                                variant="outlined"
                                startIcon={<EmailIcon />}
                                onClick={() => window.location.href = `mailto:${t('email')}`}
                                sx={{ alignSelf: 'flex-start', borderRadius: 2 }}
                            >
                                {t('contact_me')}
                            </Button>
                        </MotionPaper>
                    </Grid>
                </Grid>

                {/* Availability Section */}
                <MotionPaper
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    elevation={4}
                    sx={{
                        p: 6,
                        borderRadius: 4,
                        bgcolor: 'primary.main',
                        color: 'primary.contrastText',
                        textAlign: 'center',
                        position: 'relative',
                        overflow: 'hidden'
                    }}
                >
                    <WorkIcon sx={{ position: 'absolute', left: 20, bottom: -10, fontSize: 100, opacity: 0.1 }} />
                    <Typography variant="h4" gutterBottom fontWeight="bold">
                        {t('availability_title')}
                    </Typography>
                    <Typography variant="h6" sx={{ mb: 4, opacity: 0.9, maxWidth: '800px', mx: 'auto' }}>
                        {t('availability_description')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        startIcon={<LanguageIcon />}
                        onClick={() => window.location.href = `mailto:${t('email')}`}
                        sx={{
                            fontWeight: 'bold',
                            px: 6,
                            py: 1.5,
                            borderRadius: 3,
                            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}
                    >
                        Hire Me Remotely
                    </Button>
                </MotionPaper>
            </Stack>
        </Container>
    );
}
