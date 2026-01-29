'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { api } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { useDataGridPersistence } from '@/hooks/useDataGridPersistence';
import { GridColumnResizeParams } from '@mui/x-data-grid';

interface ExamType {
    id: string;
    code: string;
    nameAr: string;
    nameFr: string;
}

export default function ExamTypesPage() {
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
    const [exams, setExams] = useState<ExamType[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ code: '', nameAr: '', nameFr: '' });

    useEffect(() => {
        fetchExams();
    }, []);

    const fetchExams = async () => {
        try {
            setLoading(true);
            const res = await api.get('/academic/exam-types');
            setExams(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching exam types:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await api.put(`/academic/exam-types/${editingId}`, formData);
            } else {
                await api.post('/academic/exam-types', formData);
            }
            setOpen(false);
            setFormData({ code: '', nameAr: '', nameFr: '' });
            setEditingId(null);
            fetchExams();
        } catch (error) {
            console.error('Error saving exam type:', error);
        }
    };

    const handleEdit = (exam: ExamType) => {
        setFormData({ code: exam.code, nameAr: exam.nameAr, nameFr: exam.nameFr });
        setEditingId(exam.id);
        setOpen(true);
    };

    const handleDelete = async (id: string) => {
        if (confirm(t('settings.exam_types.confirm_delete'))) {
            try {
                await api.delete(`/academic/exam-types/${id}`);
                fetchExams();
            } catch (error) {
                console.error('Error deleting exam type:', error);
            }
        }
    };

    const columns: GridColDef[] = [
        { field: 'code', headerName: t('settings.exam_types.code'), width: 150 },
        {
            field: 'name',
            headerName: t('labels.name'),
            flex: 1,
            valueGetter: (value, row) => getLocalizedName(row)
        },
        { field: 'nameFr', headerName: t('settings.exam_types.name_fr'), width: 150, hideable: true },
        { field: 'nameAr', headerName: t('settings.exam_types.name_ar'), width: 150, hideable: true },
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

    const visibleColumns = columns.filter(c => !['nameFr', 'nameAr'].includes(c.field));
    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('exam-types', visibleColumns);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">{t('settings.exam_types.title')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>
                    {t('settings.exam_types.add_new')}
                </Button>
            </Box>

            <DataGrid
                rows={exams}
                columns={persistentColumns}
                onColumnResize={onColumnResize}
                loading={loading}
                autoHeight
                pagination
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />

            <EnhancedModal
                open={open}
                onClose={() => {
                    setOpen(false);
                    setFormData({ code: '', nameAr: '', nameFr: '' });
                    setEditingId(null);
                }}
                title={editingId ? t('settings.exam_types.edit_title') : t('settings.exam_types.create_title')}
                maxWidth="sm"
            >
                <TextField label={t('settings.exam_types.code')} fullWidth margin="normal" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                <TextField label={t('settings.exam_types.name_ar')} fullWidth margin="normal" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                <TextField label={t('settings.exam_types.name_fr')} fullWidth margin="normal" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave}>{editingId ? t('common.update') : t('common.create')}</Button>
            </EnhancedModal>
        </Box>
    );
}
