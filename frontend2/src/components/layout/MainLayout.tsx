'use client';
import { useState } from 'react';
import { Box, Toolbar } from '@mui/material';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

interface MainLayoutProps {
    children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    return (
        <Box sx={{ display: 'flex', position: 'relative', minHeight: '100vh', width: '100%' }}>
            <Navbar onMenuClick={handleDrawerToggle} />
            <Sidebar mobileOpen={mobileOpen} onClose={handleDrawerToggle} />
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    minWidth: 0,
                    minHeight: '100vh',
                    bgcolor: 'background.default',
                    overflowX: 'hidden'
                }}
            >
                <Toolbar /> {/* Spacer for fixed Navbar */}
                {children}
            </Box>
        </Box>
    );
}
