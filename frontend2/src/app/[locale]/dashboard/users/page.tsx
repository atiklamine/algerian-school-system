'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, Tabs, Tab, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useDataGridPersistence } from '@/hooks/useDataGridPersistence';

interface User {
    id: string;
    username: string;
    email: string;
    role: string;
}

export default function UsersPage() {
    const t = useTranslations();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState(0); // 0 for Teachers, 1 for Admins
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'Teacher' });

    useEffect(() => {
        fetchUsers();
    }, [tab]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            let endpoint = '/users/teachers';
            if (tab === 1) endpoint = '/users/admins';
            if (tab === 2) endpoint = '/users/students';

            const res = await api.get(endpoint);
            setUsers(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const data = { ...formData }; // Role is now in formData

            if (editingId) {
                await api.put(`/users/${editingId}`, data);
            } else {
                await api.post('/users', data);
            }
            setOpen(false);
            setFormData({ username: '', email: '', password: '', role: 'Teacher' });
            setEditingId(null);
            fetchUsers();
        } catch (error) {
            console.error('Error saving user:', error);
        }
    };

    const handleEdit = (user: User) => {
        setFormData({ username: user.username, email: user.email, password: '', role: user.role });
        setEditingId(user.id);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('common.confirm_delete'))) {
            try {
                await api.delete(`/users/${id}`);
                fetchUsers();
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'username', headerName: t('classes.name'), flex: 1 },
        { field: 'role', headerName: 'Role', flex: 0.5 },
        { field: 'email', headerName: t('menu.email'), flex: 1 },
        {
            field: 'actions',
            headerName: t('classes.actions'),
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small">
                        <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
                        <DeleteIcon />
                    </IconButton>
                </>
            ),
        },
    ];

    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('users', columns);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">{t('menu.users')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    {t('common.create')}
                </Button>
            </Box>

            <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
                <Tab label={t('menu.teachers')} />
                <Tab label={t('menu.admins')} />
                <Tab label={t('menu.students')} />
            </Tabs>

            <DataGrid
                rows={users}
                columns={persistentColumns}
                onColumnResize={onColumnResize}
                loading={loading}
                autoHeight
                pagination
                pageSizeOptions={[10, 25, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />

            <EnhancedModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setFormData({ username: '', email: '', password: '', role: 'Teacher' });
                    setEditingId(null);
                }}
                title={editingId ? t('common.update') : t('common.create')}
                maxWidth="sm"
            >
                <TextField
                    label={t('classes.name')}
                    fullWidth
                    margin="normal"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                />
                <TextField
                    label={t('menu.email')}
                    fullWidth
                    margin="normal"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <TextField
                    label={t('menu.password')}
                    type="password"
                    fullWidth
                    margin="normal"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    helperText={editingId ? "" : ""}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>Role</InputLabel>
                    <Select
                        value={formData.role}
                        label="Role"
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                        <MenuItem value="Administrator">Administrator</MenuItem>
                        <MenuItem value="Director">Director</MenuItem>
                        <MenuItem value="Manager">Manager</MenuItem>
                        <MenuItem value="Teacher">Teacher</MenuItem>
                        <MenuItem value="Student">Student</MenuItem>
                    </Select>
                </FormControl>

                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave}>
                    {editingId ? t('common.update') : t('common.create')}
                </Button>
            </EnhancedModal>
        </Box>
    );
}
