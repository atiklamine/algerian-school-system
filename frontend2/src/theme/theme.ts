'use client';
import { createTheme } from '@mui/material/styles';
import { Inter, Outfit } from 'next/font/google';

const outfit = Outfit({
    weight: ['300', '400', '500', '700'],
    subsets: ['latin'],
    display: 'swap',
});

const getTheme = (mode: 'light' | 'dark' | 'golden-black' | 'golden-white' | 'black-gold', direction: 'ltr' | 'rtl' = 'ltr') => {

    let paletteMode: 'light' | 'dark' = 'light';
    let primaryMain = '#6366f1';
    let backgroundDefault = '#f8fafc';
    let backgroundPaper = '#ffffff';
    let textPrimary = '#1e293b';
    let textSecondary = '#64748b';

    if (mode === 'dark') {
        paletteMode = 'dark';
        primaryMain = '#6366f1';
        backgroundDefault = '#0f172a';
        backgroundPaper = '#1e293b';
        textPrimary = '#f8fafc';
        textSecondary = '#94a3b8';
    } else if (mode === 'golden-black') {
        paletteMode = 'dark';
        primaryMain = '#FFD700'; // Gold
        backgroundDefault = '#000000'; // Pure Black
        backgroundPaper = '#121212'; // Dark Grey for paper
        textPrimary = '#FFD700'; // Gold text
        textSecondary = '#B8860B'; // Dark Golden Rod
    } else if (mode === 'golden-white') {
        paletteMode = 'light';
        primaryMain = '#B8860B'; // Dark Golden Rod
        backgroundDefault = '#FFF8DC'; // Cornsilk
        backgroundPaper = '#FFFFFF';
        textPrimary = '#B8860B';
        textSecondary = '#8B4500';
    } else if (mode === 'black-gold') {
        paletteMode = 'light';
        primaryMain = '#000000'; // Black
        backgroundDefault = '#FFD700'; // Gold
        backgroundPaper = '#FFEC8B'; // Light Golden Rod
        textPrimary = '#000000'; // Black text
        textSecondary = '#333333'; // Dark Grey
    }

    return createTheme({
        direction,
        palette: {
            mode: paletteMode,
            primary: {
                main: primaryMain,
            },
            secondary: {
                main: '#ec4899',
            },
            background: {
                default: backgroundDefault,
                paper: backgroundPaper,
            },
            text: {
                primary: textPrimary,
                secondary: textSecondary,
            },
        },
        typography: {
            fontFamily: outfit.style.fontFamily,
            h1: { fontWeight: 700 },
            h2: { fontWeight: 700 },
            h3: { fontWeight: 600 },
            h4: { fontWeight: 600 },
            h5: { fontWeight: 500 },
            h6: { fontWeight: 500 },
        },
        shape: {
            borderRadius: 12,
        },
        components: {
            MuiButton: {
                styleOverrides: {
                    root: {
                        textTransform: 'none',
                        fontWeight: 500,
                        borderRadius: 8,
                        boxShadow: 'none',
                        '&:hover': {
                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
                        },
                    },
                },
            },
            MuiPaper: {
                styleOverrides: {
                    root: {
                        backgroundImage: 'none',
                    },
                    rounded: {
                        borderRadius: 16,
                    },
                    elevation1: {
                        boxShadow: paletteMode === 'light'
                            ? '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)'
                            : '0 1px 3px 0 rgb(0 0 0 / 0.5), 0 1px 2px -1px rgb(0 0 0 / 0.5)',
                    },
                },
            },
            MuiDialog: {
                styleOverrides: {
                    paper: {
                        borderRadius: 16,
                        backdropFilter: 'blur(8px)',
                        backgroundColor: backgroundPaper,
                    }
                }
            }
        },
    });
};

export default getTheme;
