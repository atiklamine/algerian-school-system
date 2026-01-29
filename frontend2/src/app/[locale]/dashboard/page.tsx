'use client';
import { Box, Typography, Paper, Card, CardContent, CircularProgress } from '@mui/material';
import { useTranslations } from 'next-intl';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export default function DashboardPage() {
    const t = useTranslations();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({
        classes: 0,
        subjects: 0,
        students: 0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await api.get('/academic/stats');
                if (response.data.success) {
                    setData(response.data.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const stats = [
        { title: t('dashboard.stats.classes'), value: data.classes, icon: <ClassIcon sx={{ fontSize: 40 }} />, color: '#6366f1' },
        { title: t('dashboard.stats.subjects'), value: data.subjects, icon: <SchoolIcon sx={{ fontSize: 40 }} />, color: '#ec4899' },
        { title: t('dashboard.stats.students'), value: data.students, icon: <DashboardIcon sx={{ fontSize: 40 }} />, color: '#10b981' },
    ];

    return (
        <Box>
            <Typography variant="h4" fontWeight="bold" mb={4}>{t('menu.dashboard')}</Typography>

            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3 }}>
                {stats.map((stat, index) => (
                    <Card key={index} sx={{ height: '100%', background: `linear-gradient(135deg, ${stat.color}22 0%, ${stat.color}11 100%)` }}>
                        <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Box>
                                    <Typography variant="h6" color="text.secondary" gutterBottom>{stat.title}</Typography>
                                    <Typography variant="h3" fontWeight="bold">
                                        {loading ? <CircularProgress size={30} sx={{ color: stat.color }} /> : stat.value}
                                    </Typography>
                                </Box>
                                <Box sx={{ color: stat.color }}>{stat.icon}</Box>
                            </Box>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            <Paper sx={{ p: 3, mt: 4 }}>
                <Typography variant="h6" gutterBottom>{t('dashboard.welcome_title')}</Typography>
                <Typography color="text.secondary">
                    {t('dashboard.welcome_desc')}
                </Typography>
            </Paper>
        </Box>
    );
}
