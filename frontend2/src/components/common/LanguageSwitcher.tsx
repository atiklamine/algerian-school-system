'use client';

import { useState } from 'react';
import { IconButton, Menu, MenuItem, Box, Tooltip } from '@mui/material';
import LanguageIcon from '@mui/icons-material/Language';
import { usePathname, useRouter } from 'next/navigation';

const languages = [
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'tr', name: 'Türkće', flag: '🇹🇷' },
    { code: 'tam', name: 'Tamazight', flag: 'ⵣ' }
];

export default function LanguageSwitcher() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const router = useRouter();
    const pathname = usePathname();

    const currentLocale = pathname?.split('/')[1] || 'fr';
    const currentLang = languages.find(l => l.code === currentLocale) || languages[1];

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleLanguageChange = (newLocale: string) => {
        const segments = pathname.split('/');
        if (segments.length > 1) {
            segments[1] = newLocale;
            const newPath = segments.join('/');
            router.push(newPath);
        }
        handleClose();
    };

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    fontSize: '0.9rem',
                    mr: -0.5,
                    ml: 1,
                    opacity: 0.9,
                    filter: 'drop-shadow(0 1px 1px rgba(0,0,0,0.1))',
                    cursor: 'default',
                    userSelect: 'none'
                }}
                title={`Current: ${currentLang.name}`}
            >
                {currentLang.flag}
            </Box>
            <Tooltip title="Switch Language">
                <IconButton onClick={handleMenu} color="inherit" sx={{ padding: 1.5 }}>
                    <LanguageIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                disableScrollLock
                sx={{ mt: 1 }}
            >
                {languages.map((lang) => {
                    const isSelected = lang.code === currentLocale;
                    return (
                        <MenuItem
                            key={lang.code}
                            onClick={isSelected ? undefined : () => handleLanguageChange(lang.code)}
                            sx={{
                                minHeight: 48,
                                minWidth: 160,
                                gap: 2,
                                opacity: isSelected ? 1 : 0.8,
                                cursor: isSelected ? 'default' : 'pointer',
                                bgcolor: isSelected ? 'action.selected' : 'transparent',
                                fontWeight: isSelected ? 700 : 400,
                                '&:hover': {
                                    bgcolor: isSelected ? 'action.selected' : undefined,
                                }
                            }}
                        >
                            <span style={{ fontSize: '1.2rem' }}>{lang.flag}</span>
                            {lang.name}
                        </MenuItem>
                    );
                })}
            </Menu>
        </Box>
    );
}
