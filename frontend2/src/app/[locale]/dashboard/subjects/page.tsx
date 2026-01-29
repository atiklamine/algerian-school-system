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

interface Subject {
    id: string;
    code: string;
    nameAr: string;
    nameFr: string;
}

export default function SubjectsPage() {
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
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ code: '', nameAr: '', nameFr: '' });
    // Bulk Selection State
    const [selectionModel, setSelectionModel] = useState<any>([]);

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const res = await api.get('/academic/subjects');
            setSubjects(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            setActionLoading(true);
            if (editingId) {
                await api.put(`/academic/subjects/${editingId}`, formData);
            } else {
                await api.post('/academic/subjects', formData);
            }
            setOpen(false);
            setFormData({ code: '', nameAr: '', nameFr: '' });
            setEditingId(null);
            fetchSubjects();
        } catch (error) {
            console.error('Error saving subject:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEdit = (subject: Subject) => {
        setFormData({ code: subject.code, nameAr: subject.nameAr, nameFr: subject.nameFr });
        setEditingId(subject.id);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('common.confirm_delete'))) {
            try {
                // Ideally show loading for delete row action? 
                // Since this is inline, maybe just refresh after. 
                // Or we can add a deletingId state.
                await api.delete(`/academic/subjects/${id}`);
                fetchSubjects();
            } catch (error) {
                console.error('Error deleting subject:', error);
            }
        }
    };

    // Bulk Operations
    const handleBulkDelete = async () => {
        if (!selectionModel.length) return;
        if (!confirm(`${t('classes.delete')} ${selectionModel.length} items?`)) return;
        try {
            setActionLoading(true);
            const res = await api.delete('/academic/subjects/bulk', { data: { ids: selectionModel } });
            if (res.status === 200 || res.status === 201) {
                setSelectionModel([]);
                fetchSubjects();
            }
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    const handleExportSubjects = () => {
        const dataToExport = subjects.map(s => ({
            Code: s.code,
            NameAr: s.nameAr,
            NameFr: s.nameFr
        }));
        excelUtil.export(dataToExport, "subjects_list", t('menu.subjects'));
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        excelUtil.import(file, async (data) => {
            const mappedSubjects = excelUtil.mapData(data, {
                'Code': 'code',
                'NameAr': 'nameAr',
                'NameFr': 'nameFr'
            }).filter(s => s.code && (s.nameAr || s.nameFr));

            if (mappedSubjects.length > 0) {
                try {
                    setActionLoading(true);
                    const res = await api.post('/academic/subjects/bulk', { subjects: mappedSubjects });
                    if (res.status === 200 || res.status === 201) fetchSubjects();
                } catch (error) { console.error(error); }
                finally { setActionLoading(false); }
            }
        });
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const columns: GridColDef[] = [
        { field: 'code', headerName: t('labels.code'), width: 100 },
        {
            field: 'name',
            headerName: t('labels.name'),
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) => getLocalizedName(row)
        },
        { field: 'nameFr', headerName: t('labels.name_fr'), width: 150, hideable: true },
        { field: 'nameAr', headerName: t('labels.name_ar'), width: 150, hideable: true },
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
        if (isMobile) return ['code', 'name', 'actions'].includes(col.field);
        return !['nameFr', 'nameAr'].includes(col.field);
    });

    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('subjects', visibleColumns);

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
                <Typography variant="h4" fontWeight="bold">{t('menu.subjects')}</Typography>
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
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportSubjects} disabled={actionLoading} sx={{ flex: { xs: 1, sm: 'none' } }}>
                        {t('common.export')}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)} disabled={actionLoading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {t('common.create')}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={subjects}
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
                    setFormData({ code: '', nameAr: '', nameFr: '' });
                    setEditingId(null);
                }}
                title={editingId ? t('common.update') : t('common.create')}
                maxWidth="sm"
            >
                <TextField
                    label={t('labels.code')}
                    fullWidth
                    margin="normal"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
                <TextField
                    label={t('labels.name_ar')}
                    fullWidth
                    margin="normal"
                    value={formData.nameAr}
                    onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })}
                />
                <TextField
                    label={t('labels.name_fr')}
                    fullWidth
                    margin="normal"
                    value={formData.nameFr}
                    onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })}
                />
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave} disabled={actionLoading}>
                    {actionLoading ? t('classes.saving') : (editingId ? t('common.update') : t('common.create'))}
                </Button>
            </EnhancedModal>
        </Box >
    );
}
