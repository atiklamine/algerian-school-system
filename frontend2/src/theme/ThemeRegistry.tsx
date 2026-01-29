'use client';
import * as React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import NextAppDirEmotionCacheProvider from './EmotionCache';
import getTheme from './theme';

import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';

export type ThemeMode = 'light' | 'dark' | 'golden-black' | 'golden-white' | 'black-gold';

export const ColorModeContext = React.createContext({
    toggleColorMode: () => { },
    mode: 'light' as ThemeMode
});

export default function ThemeRegistry({ children, locale = 'en' }: { children: React.ReactNode, locale?: string }) {
    const [mode, setMode] = React.useState<ThemeMode>('light');
    const [mounted, setMounted] = React.useState(false);
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    // Hydrate from localStorage
    React.useEffect(() => {
        const savedMode = localStorage.getItem('themeMode') as ThemeMode;
        if (savedMode) {
            setMode(savedMode);
        }
        setMounted(true);
    }, []);

    // Save to localStorage
    React.useEffect(() => {
        if (mounted) {
            localStorage.setItem('themeMode', mode);
        }
    }, [mode, mounted]);

    const colorMode = React.useMemo(
        () => ({
            toggleColorMode: () => {
                setMode((prevMode) => {
                    let nextMode: ThemeMode;
                    if (prevMode === 'light') nextMode = 'dark';
                    else if (prevMode === 'dark') nextMode = 'golden-black';
                    else if (prevMode === 'golden-black') nextMode = 'golden-white';
                    else if (prevMode === 'golden-white') nextMode = 'black-gold';
                    else nextMode = 'light';
                    return nextMode;
                });
            },
            mode,
        }),
        [mode],
    );

    const theme = React.useMemo(() => getTheme(mode, direction), [mode, direction]);

    const cacheRtl = React.useMemo(() => createCache({
        key: 'mui-style-rtl',
        stylisPlugins: [prefixer, rtlPlugin],
    }), []);

    const cacheLtr = React.useMemo(() => createCache({
        key: 'mui-style-ltr',
    }), []);

    return (
        <NextAppDirEmotionCacheProvider options={{ key: 'mui' }}>
            <CacheProvider value={direction === 'rtl' ? cacheRtl : cacheLtr}>
                <ColorModeContext.Provider value={colorMode}>
                    <ThemeProvider theme={theme}>
                        <CssBaseline />
                        {children}
                    </ThemeProvider>
                </ColorModeContext.Provider>
            </CacheProvider>
        </NextAppDirEmotionCacheProvider>
    );
}
