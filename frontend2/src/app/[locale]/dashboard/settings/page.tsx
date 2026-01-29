'use client';
import { Box, Typography, Grid, Card, CardContent, CardActions, Button } from '@mui/material';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export default function SettingsHubPage() {
    const t = useTranslations();
    const router = useRouter();
    const params = useParams();
    const locale = params.locale || 'fr';

    const settingsItems = [
        {
            title: t('settings.exam_types.title'),
            description: t('settings.exam_types.description'),
            icon: <SchoolIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            path: `/${locale}/dashboard/settings/exam-types`
        },
        {
            title: t('settings.periods.title'),
            description: t('settings.periods.description'),
            icon: <CalendarMonthIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
            path: `/${locale}/dashboard/settings/periods`
        },
        {
            title: t('settings.academic_years.title'),
            description: t('settings.academic_years.description'),
            icon: <CalendarMonthIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
            path: `/${locale}/dashboard/settings/years`
        },
        {
            title: t('settings.levels_majors.title'),
            description: t('settings.levels_majors.description'),
            icon: <SchoolIcon sx={{ fontSize: 40, color: 'info.main' }} />,
            path: `/${locale}/dashboard/settings/majors`
        }
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={1}>{t('settings.title')}</Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>{t('settings.subtitle')}</Typography>

            <Grid container spacing={3}>
                {settingsItems.map((item, index) => (
                    <Grid size={{ xs: 12, md: 4 }} key={index}>
                        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', borderRadius: 2 }}>
                            <CardContent sx={{ flexGrow: 1 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                    {item.icon}
                                    <Typography variant="h6" sx={{ ml: 2, fontWeight: 'bold' }}>
                                        {item.title}
                                    </Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    {item.description}
                                </Typography>
                            </CardContent>
                            <CardActions sx={{ p: 2, pt: 0 }}>
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => router.push(item.path)}
                                    sx={{ borderRadius: 2 }}
                                >
                                    {t('settings.manage')}
                                </Button>
                            </CardActions>
                        </Card>
                    </Grid>
                ))}
            </Grid>
        </Box>
    );
}
