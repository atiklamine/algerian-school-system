'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, useTheme, useMediaQuery } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { api } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { excelUtil } from '@/utils/excel';
import { useDataGridPersistence } from '@/hooks/useDataGridPersistence';
import { GridRowSelectionModel, GridColumnResizeParams } from '@mui/x-data-grid';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

interface Student {
    id: string;
    username: string;
    email: string;
    role: string;
}

export default function StudentsPage() {
    const t = useTranslations();
    const locale = useLocale();

    const getLocalizedName = (item: any) => {
        if (!item) return '';
        const nameMap: any = {
            ar: item.nameAr,
            fr: item.nameFr,
            en: item.nameEn,
            tam: item.nameTam || item.nameZgh,
            tr: item.nameTr,
            de: item.nameDe
        };
        return nameMap[locale] || item.nameEn || item.nameFr || item.nameAr || item.name || item.id;
    };
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    // Bulk Selection State
    const [selectionModel, setSelectionModel] = useState<any>([]);

    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const res = await api.get('/users/students');
            setStudents(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setActionLoading(true);
            if (editingId) {
                await api.put(`/users/${editingId}`, formData);
            } else {
                await api.post('/users/student', formData);
            }
            setOpen(false);
            setFormData({ username: '', email: '', password: '' });
            setEditingId(null);
            fetchStudents();
        } catch (error) {
            console.error('Error saving student:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (student: Student) => {
        setFormData({ username: student.username, email: student.email, password: '' });
        setEditingId(student.id);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('common.confirm_delete'))) {
            try {
                await api.delete(`/users/${id}`);
                fetchStudents();
            } catch (error) {
                console.error('Error deleting student:', error);
            }
        }
    };

    // Bulk Operations
    const handleBulkDelete = async () => {
        if (!selectionModel.length) return;
        if (!confirm(`${t('classes.delete')} ${selectionModel.length} items?`)) return;
        try {
            setActionLoading(true);
            const res = await api.delete('/users/bulk-delete', { data: { ids: selectionModel } });
            if (res.status === 200 || res.status === 201) {
                setSelectionModel([]);
                fetchStudents();
            }
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    const handleExportStudents = () => {
        const dataToExport = students.map((s: any) => ({
            Username: s.username,
            Email: s.email,
            Class: s.class?.name || '-',
            Year: s.class?.academicYear?.name || '-',
            Level: s.class?.major?.level?.name || '-',
            Major: s.class?.major?.name || '-'
        }));
        excelUtil.export(dataToExport, "students_list", t('common.students'));
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        excelUtil.import(file, async (data) => {
            const mappedStudents = excelUtil.mapData(data, {
                'Username': 'username',
                'Email': 'email',
                'Password': 'password'
            }).filter(s => s.username && s.email);

            if (mappedStudents.length > 0) {
                try {
                    setActionLoading(true);
                    const res = await api.post('/users/bulk-students', { students: mappedStudents });
                    if (res.status === 200 || res.status === 201) fetchStudents();
                } catch (error) { console.error(error); }
                finally { setActionLoading(false); }
            }
        });
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const columns: GridColDef[] = [
        { field: 'username', headerName: t('classes.name'), flex: 1, minWidth: 150 },
        {
            field: 'level',
            headerName: t('classes.level'),
            width: 100,
            valueGetter: (value, row) => getLocalizedName(row?.class?.major?.level) || '-',
            hideable: true
        },
        {
            field: 'major',
            headerName: t('labels.major'),
            width: 120,
            valueGetter: (value, row) => getLocalizedName(row?.class?.major) || '-',
            hideable: true
        },
        {
            field: 'className',
            headerName: t('bulletin.class'),
            width: 100,
            valueGetter: (value, row) => row?.class?.name || '-', // Class names usually don't have translations as they are suffixes like 'C1', 'C2' etc. but let's keep it safe.
            hideable: true
        },
        { field: 'email', headerName: t('menu.email'), flex: 1, minWidth: 150, hideable: true },
        {
            field: 'actions',
            headerName: t('classes.actions'),
            width: 120,
            sortable: false,
            renderCell: (params) => (
                <Box>
                    <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(params.row.id)} color="error" size="small">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    const visibleColumns = columns.filter(col => {
        if (isMobile) return ['username', 'actions'].includes(col.field);
        if (isTablet) return ['username', 'className', 'actions'].includes(col.field);
        return true;
    });

    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('students', visibleColumns);

    return (
        <Box>
            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'flex-start', sm: 'center' },
                mb: 4,
                gap: 2
            }}>
                <Typography variant="h4" fontWeight="bold">{t('common.students')}</Typography>
                <Box sx={{
                    display: 'flex',
                    gap: 1,
                    flexWrap: 'wrap',
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'flex-start', sm: 'flex-end' }
                }}>
                    {selectionModel.length > 0 && (
                        <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleBulkDelete} disabled={actionLoading}>
                            {selectionModel.length}
                        </Button>
                    )}
                    <Button variant="outlined" component="label" startIcon={<FileUploadIcon />} disabled={actionLoading} sx={{ flex: { xs: 1, sm: 'none' } }}>
                        {t('common.import')}
                        <input type="file" hidden accept=".xlsx, .xls" onChange={handleImportExcel} />
                    </Button>
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportStudents} disabled={actionLoading} sx={{ flex: { xs: 1, sm: 'none' } }}>
                        {t('common.export')}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} disabled={actionLoading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {t('common.create')}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={students}
                    columns={persistentColumns}
                    onColumnResize={onColumnResize}
                    loading={loading}
                    pagination
                    checkboxSelection
                    onRowSelectionModelChange={(newModel) => setSelectionModel(newModel)}
                    rowSelectionModel={selectionModel}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': {
                            bgcolor: 'action.hover',
                            fontWeight: 'bold'
                        }
                    }}
                />
            </Box>

            <EnhancedModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setFormData({ username: '', email: '', password: '' });
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
                    helperText={editingId ? "" : ""} // Can add a helper text from translations if needed
                />
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave} disabled={actionLoading}>
                    {actionLoading ? t('classes.saving') : (editingId ? t('common.update') : t('common.create'))}
                </Button>
            </EnhancedModal>
        </Box >
    );
}
