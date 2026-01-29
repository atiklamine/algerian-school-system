'use client';
import { Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Toolbar, useMediaQuery, useTheme, Box } from '@mui/material';
import { useState, useEffect } from 'react';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ClassIcon from '@mui/icons-material/Class';
import SchoolIcon from '@mui/icons-material/School';
import SettingsIcon from '@mui/icons-material/Settings';
import PeopleIcon from '@mui/icons-material/People';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import SecurityIcon from '@mui/icons-material/Security';
import Link from 'next/link';
import { useParams } from 'next/navigation';

const drawerWidth = 240;

interface SidebarProps {
    mobileOpen: boolean;
    onClose: () => void;
}

import { useTranslations } from 'next-intl';

import { getUserRole, hasPermission } from '@/utils/auth';

const menuItems = [
    { key: 'dashboard', icon: <DashboardIcon />, path: '/dashboard', permission: null }, // Public
    { key: 'classes', icon: <ClassIcon />, path: '/dashboard/classes', permission: 'class.read' },
    { key: 'subjects', icon: <SchoolIcon />, path: '/dashboard/subjects', permission: 'subject.manage' },
    { key: 'students', icon: <PeopleIcon />, path: '/dashboard/students', permission: 'user.read' },
    { key: 'majors', icon: <AccountTreeIcon />, path: '/dashboard/settings/majors', permission: 'settings.manage' },
    { key: 'users', icon: <SupervisorAccountIcon />, path: '/dashboard/users', permission: 'user.read' },
    { key: 'my_grades', icon: <SchoolIcon />, path: '/dashboard/my-grades', permission: 'student.grades.view' },
    { key: 'my_schedule', icon: <SchoolIcon />, path: '/dashboard/my-schedule', permission: 'student.schedule.view' },
    { key: 'my_bulletins', icon: <SchoolIcon />, path: '/dashboard/my-bulletins', permission: 'student.bulletin.view' },
    { key: 'grading', icon: <SchoolIcon />, path: '/dashboard/grading', permission: 'grade.enter' },
    { key: 'roles', icon: <SecurityIcon />, path: '/dashboard/roles', permission: 'user.create' }, // Approximation for Admin
    { key: 'settings', icon: <SettingsIcon />, path: '/dashboard/settings', permission: 'settings.manage' },
];

export default function Sidebar({ mobileOpen, onClose }: SidebarProps) {
    const t = useTranslations('menu');
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('lg'));
    const params = useParams();
    const locale = params.locale || 'fr';

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const filteredMenuItems = menuItems.filter(item => {
        if (!item.permission) return true; // Public items always shown
        if (!mounted) return false; // Hide protected items during SSR/initial render

        // Special case: Roles page is implicit Admin only for now, but we can verify against 'user.create' + Admin role check inside hasPermission
        return hasPermission(item.permission);
    });

    // Avoid hydration mismatch logic entirely by rendering simple structure first if needed, 
    // but the filter above ensures matching HTML for the first render (only public items).

    const drawer = (
        <div>
            <Toolbar>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.main', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <SchoolIcon /> Scholara
                </Box>
            </Toolbar>
            <List>
                {filteredMenuItems.map((item) => (
                    <ListItem key={item.key} disablePadding>
                        <ListItemButton
                            component={Link}
                            href={`/${locale}${item.path}`}
                            onClick={() => {
                                if (isMobile) onClose();
                            }}
                        >
                            <ListItemIcon sx={{ color: 'primary.main' }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText primary={t(item.key)} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </div>
    );

    return (
        <Box
            component="nav"
            sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
        >
            {/* Mobile Drawer */}
            <Drawer
                variant="temporary"
                open={mobileOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', lg: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {drawer}
            </Drawer>

            {/* Desktop Drawer */}
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', lg: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: 'none', backgroundColor: 'background.default' },
                }}
                open
            >
                {drawer}
            </Drawer>
        </Box>
    );
}
