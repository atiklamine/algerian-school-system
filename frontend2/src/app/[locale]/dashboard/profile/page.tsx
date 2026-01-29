'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Paper, Grid, Avatar, CircularProgress, Alert, Divider, Chip } from '@mui/material';
import { api } from '@/lib/api';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

interface UserProfile {
    id: string;
    username: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    createdAt: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const response = await api.get('/users/profile');
                if (response.data.success) {
                    setProfile(response.data.data);
                } else {
                    setError('Failed to load profile data');
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
                setError('Failed to load profile. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    if (!profile) return null;

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'Administrator': return 'error';
            case 'Director': return 'warning';
            case 'Manager': return 'info';
            case 'Teacher': return 'success';
            case 'Student': return 'primary';
            default: return 'default';
        }
    };

    return (
        <Box sx={{ p: 3, maxWidth: 1200, margin: '0 auto' }}>
            <Typography variant="h4" sx={{ mb: 4, fontWeight: 'bold', color: 'primary.main' }}>
                User Profile
            </Typography>

            <Grid container spacing={4}>
                {/* Left Column: Avatar & Basic Info */}
                <Grid size={{ xs: 12, md: 4 }}>
                    <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', borderRadius: 2 }}>
                        <Avatar
                            sx={{ width: 120, height: 120, mb: 2, bgcolor: 'primary.main', fontSize: '3rem' }}
                        >
                            {profile.username.charAt(0).toUpperCase()}
                        </Avatar>
                        <Typography variant="h5" gutterBottom fontWeight="bold">
                            {profile.firstName ? `${profile.firstName} ${profile.lastName}` : profile.username}
                        </Typography>
                        <Chip
                            label={profile.role}
                            color={getRoleColor(profile.role) as any}
                            icon={<AdminPanelSettingsIcon />}
                            sx={{ mb: 3 }}
                        />

                        <Box sx={{ width: '100%' }}>
                            <Divider sx={{ mb: 2 }} />
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                                <BadgeIcon sx={{ mr: 1 }} />
                                <Typography variant="body1">@{profile.username}</Typography>
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, color: 'text.secondary' }}>
                                <EmailIcon sx={{ mr: 1 }} />
                                <Typography variant="body1">{profile.email}</Typography>
                            </Box>
                        </Box>
                    </Paper>
                </Grid>

                {/* Right Column: Detailed Info */}
                <Grid size={{ xs: 12, md: 8 }}>
                    <Paper elevation={3} sx={{ p: 4, borderRadius: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center' }}>
                            <PersonIcon sx={{ mr: 1 }} /> Personal Information
                        </Typography>
                        <Divider sx={{ mb: 3 }} />

                        <Grid container spacing={3}>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">First Name</Typography>
                                <Typography variant="body1">{profile.firstName || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Last Name</Typography>
                                <Typography variant="body1">{profile.lastName || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Phone</Typography>
                                <Typography variant="body1">{profile.phone || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Address</Typography>
                                <Typography variant="body1">{profile.address || '-'}</Typography>
                            </Grid>
                            <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="subtitle2" color="text.secondary">Joined Date</Typography>
                                <Typography variant="body1">{new Date(profile.createdAt).toLocaleDateString()}</Typography>
                            </Grid>
                        </Grid>
                    </Paper>
                </Grid>
            </Grid>
        </Box>
    );
}
