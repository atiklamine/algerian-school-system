'use client';
import { AppBar, Toolbar, IconButton, Typography, Box, Badge, Avatar, Menu, MenuItem, useTheme } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsIcon from '@mui/icons-material/Notifications';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import PaletteIcon from '@mui/icons-material/Palette';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'; // Premium icon for golden themes
import { ColorModeContext } from '@/theme/ThemeRegistry';
import React from 'react';
import { useRouter } from 'next/navigation';
import LanguageSwitcher from '../common/LanguageSwitcher';

interface NavbarProps {
    onMenuClick: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
    const theme = useTheme();
    const colorMode = React.useContext(ColorModeContext);
    const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
    const router = useRouter();

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLogout = () => {
        handleClose();
        localStorage.clear();
        router.push('/login');
    };

    const getThemeIcon = () => {
        if (colorMode.mode === 'light') return <Brightness4Icon />;
        if (colorMode.mode === 'dark') return <Brightness7Icon />;
        if (colorMode.mode === 'golden-black') return <AutoFixHighIcon />;
        if (colorMode.mode === 'golden-white') return <PaletteIcon />;
        if (colorMode.mode === 'black-gold') return <Brightness4Icon sx={{ color: 'common.black' }} />;
        return <Brightness4Icon />;
    };

    const getThemeTitle = () => {
        const themeNames: Record<string, string> = {
            'light': 'Light Theme',
            'dark': 'Dark Theme',
            'golden-black': 'Golden Black Theme',
            'golden-white': 'Golden White Theme',
            'black-gold': 'Black Gold Theme (Inverse)'
        };
        return themeNames[colorMode.mode] || 'Switch Theme';
    };

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { lg: `calc(100% - 240px)` },
                marginInlineStart: { lg: `240px` },
                boxShadow: 'none',
                bgcolor: 'background.paper',
                color: 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider',
                zIndex: (theme) => theme.zIndex.drawer + 1
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={onMenuClick}
                    sx={{ mr: 2, display: { lg: 'none' }, padding: 1.5 }} // Larger tap target
                >
                    <MenuIcon />
                </IconButton>
                <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1, fontWeight: 600 }}>
                    Dashboard
                </Typography>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <LanguageSwitcher />
                    <IconButton
                        onClick={colorMode.toggleColorMode}
                        color="inherit"
                        title={getThemeTitle()}
                        sx={{ padding: 1.5 }} // Larger tap target
                    >
                        {getThemeIcon()}
                    </IconButton>
                    <IconButton
                        color="inherit"
                        sx={{ padding: 1.5 }}
                    >
                        <Badge badgeContent={4} color="secondary">
                            <NotificationsIcon />
                        </Badge>
                    </IconButton>
                    <IconButton
                        onClick={handleMenu}
                        size="small"
                        sx={{ ml: 1, padding: 0.5 }} // slightly smaller padding for avatar wrapper but avatar is visually large
                        aria-controls="menu-appbar"
                        aria-haspopup="true"
                    >
                        <Avatar sx={{ bgcolor: 'primary.main', width: 36, height: 36 }}>A</Avatar>
                    </IconButton>
                    <Menu
                        id="menu-appbar"
                        anchorEl={anchorEl}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        keepMounted
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                        sx={{ mt: 1 }}
                        disableScrollLock
                    >
                        <MenuItem onClick={() => { handleClose(); router.push('/dashboard/profile'); }} sx={{ minHeight: 48, minWidth: 150 }}>Profile</MenuItem>
                        {/* Use onClick directly but with touch-action awareness */}
                        <MenuItem
                            onClick={handleLogout}
                            sx={{ minHeight: 48, color: 'error.main' }}
                        >
                            Logout
                        </MenuItem>
                    </Menu>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
