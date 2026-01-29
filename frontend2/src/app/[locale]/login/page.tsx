'use client';
import { useState } from 'react';
import { Box, TextField, Button, Typography, Paper, Alert } from '@mui/material';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { saveUserPermissions } from '@/utils/auth';

export default function LoginPage() {
    const t = useTranslations();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Collect device information for security monitoring
        const deviceInfo = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            language: navigator.language,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timestamp: new Date().toISOString(),
            email: email,
            deviceType: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
            browser: navigator.userAgent.includes('Chrome') ? 'Chrome' :
                navigator.userAgent.includes('Firefox') ? 'Firefox' :
                    navigator.userAgent.includes('Safari') ? 'Safari' : 'Unknown'
        };

        try {
            const response = await api.post('/auth/login', {
                email,
                password,
                deviceInfo  // Send device info to backend for logging
            });

            if (response.data?.success && response.data?.data?.accessToken) {
                // Store token in localStorage
                localStorage.setItem('accessToken', response.data.data.accessToken);

                // Store permissions
                if (response.data.data.user.permissions) {
                    saveUserPermissions(response.data.data.user.permissions);
                }

                // Log successful login
                console.log('✅ Login SUCCESSFUL from:', deviceInfo);
                console.log('📱 Device:', deviceInfo.deviceType);
                console.log('🌐 Browser:', deviceInfo.browser);

                // Redirect to dashboard with locale prefix
                const currentPath = window.location.pathname;
                const locale = currentPath.startsWith('/ar') ? 'ar' : 'fr';
                router.push(`/${locale}/dashboard`);
            } else {
                // Log failed login attempt
                console.warn('❌ Login FAILED - Invalid credentials from:', deviceInfo);
                setError(t('auth.login_failed_creds'));
            }
        } catch (err: any) {
            // Log failed login attempt with error
            console.error('❌ Login FAILED - Error from:', deviceInfo);
            console.error('Error details:', err.response?.data || err.message);
            setError(err.response?.data?.message || t('auth.login_failed_try_again'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
        >
            <Paper
                elevation={10}
                sx={{
                    p: 4,
                    maxWidth: 400,
                    width: '100%',
                    borderRadius: 3,
                }}
            >
                <Typography variant="h4" fontWeight="bold" textAlign="center" mb={1}>
                    {t('menu.login')}
                </Typography>
                <Typography variant="body2" textAlign="center" color="text.secondary" mb={3}>
                    {t('common.app_title')}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleLogin}>
                    <TextField
                        label={t('menu.email')}
                        type="email"
                        fullWidth
                        margin="normal"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <TextField
                        label={t('menu.password')}
                        type="password"
                        fullWidth
                        margin="normal"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                    <Button
                        type="submit"
                        variant="contained"
                        fullWidth
                        size="large"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? t('auth.logging_in') : t('menu.login')}
                    </Button>
                </form>
            </Paper>
        </Box>
    );
}
