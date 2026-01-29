'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, FormControlLabel, Switch } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { api } from '@/lib/api';
import { useTranslations } from 'next-intl';
import { useDataGridPersistence } from '@/hooks/useDataGridPersistence';
import { GridColumnResizeParams } from '@mui/x-data-grid';

interface AcademicYear {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
}

export default function YearsPage() {
    const t = useTranslations();
    const [years, setYears] = useState<AcademicYear[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', startDate: '', endDate: '', isCurrent: false });

    useEffect(() => {
        fetchYears();
    }, []);

    const fetchYears = async () => {
        try {
            setLoading(true);
            const res = await api.get('/academic/years');
            setYears(res.data?.data || []);
        } catch (error) {
            console.error('Error fetching years:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await api.put(`/academic/years/${editingId}`, formData);
            } else {
                await api.post('/academic/years', formData);
            }
            setOpen(false);
            setFormData({ name: '', startDate: '', endDate: '', isCurrent: false });
            setEditingId(null);
            fetchYears();
        } catch (error) {
            console.error('Error saving year:', error);
        }
    };

    const handleEdit = (y: AcademicYear) => {
        setFormData({
            name: y.name,
            startDate: y.startDate.split('T')[0],
            endDate: y.endDate.split('T')[0],
            isCurrent: y.isCurrent
        });
        setEditingId(y.id);
        setOpen(true);
    };

    const columns: GridColDef[] = [
        { field: 'name', headerName: t('classes.year'), flex: 1 },
        { field: 'startDate', headerName: t('settings.periods.start_date'), width: 150, valueGetter: (v) => (v as string)?.split('T')[0] },
        { field: 'endDate', headerName: t('settings.periods.end_date'), width: 150, valueGetter: (v) => (v as string)?.split('T')[0] },
        { field: 'isCurrent', headerName: t('settings.academic_years.current'), width: 100, type: 'boolean' },
        {
            field: 'actions',
            headerName: t('classes.actions'),
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small"><EditIcon /></IconButton>
                    <IconButton onClick={async () => { if (confirm(t('settings.academic_years.confirm_delete'))) { await api.delete(`/academic/years/${params.row.id}`); fetchYears(); } }} color="error" size="small"><DeleteIcon /></IconButton>
                </>
            ),
        },
    ];

    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('years', columns);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">{t('settings.academic_years.title')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>{t('common.create')}</Button>
            </Box>

            <DataGrid
                rows={years}
                columns={persistentColumns}
                onColumnResize={onColumnResize}
                loading={loading}
                autoHeight
                pagination
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />

            <EnhancedModal open={open} onClose={() => { setOpen(false); setEditingId(null); }} title={editingId ? t('settings.academic_years.edit_title') : t('settings.academic_years.create_title')} maxWidth="sm">
                <TextField label={t('settings.academic_years.name_placeholder')} fullWidth margin="normal" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <TextField label={t('settings.periods.start_date')} type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <TextField label={t('settings.periods.end_date')} type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                <FormControlLabel control={<Switch checked={formData.isCurrent} onChange={(e) => setFormData({ ...formData, isCurrent: e.target.checked })} />} label={t('settings.academic_years.is_current_label')} sx={{ mt: 1 }} />
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave}>{editingId ? t('common.update') : t('common.create')}</Button>
            </EnhancedModal>
        </Box>
    );
}
