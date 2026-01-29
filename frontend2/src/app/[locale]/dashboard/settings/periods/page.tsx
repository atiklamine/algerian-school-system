'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, IconButton, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { api } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { useDataGridPersistence } from '@/hooks/useDataGridPersistence';
import { GridColumnResizeParams } from '@mui/x-data-grid';

interface Period {
    id: string;
    code: string;
    nameAr: string;
    nameFr: string;
    startDate: string;
    endDate: string;
    academicYearId: string;
}

export default function PeriodsPage() {
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
    const [periods, setPeriods] = useState<Period[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [open, setOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ code: '', nameAr: '', nameFr: '', startDate: '', endDate: '', academicYearId: '' });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [pRes, yRes] = await Promise.all([
                api.get('/academic/periods'),
                api.get('/academic/years')
            ]);
            setPeriods(pRes.data?.data || []);
            setYears(yRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching periods:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            if (editingId) {
                await api.put(`/academic/periods/${editingId}`, formData);
            } else {
                await api.post('/academic/periods', formData);
            }
            setOpen(false);
            setFormData({ code: '', nameAr: '', nameFr: '', startDate: '', endDate: '', academicYearId: '' });
            setEditingId(null);
            fetchData();
        } catch (error) {
            console.error('Error saving period:', error);
        }
    };

    const handleEdit = (p: Period) => {
        setFormData({
            code: p.code,
            nameAr: p.nameAr,
            nameFr: p.nameFr,
            startDate: p.startDate.split('T')[0],
            endDate: p.endDate.split('T')[0],
            academicYearId: p.academicYearId
        });
        setEditingId(p.id);
        setOpen(true);
    };

    const columns: GridColDef[] = [
        { field: 'code', headerName: t('settings.periods.code'), width: 100 },
        {
            field: 'name',
            headerName: t('labels.name'),
            flex: 1,
            valueGetter: (value, row) => getLocalizedName(row)
        },
        { field: 'nameFr', headerName: t('settings.periods.name_fr'), width: 150, hideable: true },
        { field: 'nameAr', headerName: t('settings.periods.name_ar'), width: 150, hideable: true },
        { field: 'startDate', headerName: t('settings.periods.start_date'), width: 120, valueGetter: (v) => (v as string)?.split('T')[0] },
        { field: 'endDate', headerName: t('settings.periods.end_date'), width: 120, valueGetter: (v) => (v as string)?.split('T')[0] },
        {
            field: 'actions',
            headerName: t('classes.actions'),
            width: 120,
            renderCell: (params) => (
                <>
                    <IconButton onClick={() => handleEdit(params.row)} color="primary" size="small"><EditIcon /></IconButton>
                    <IconButton onClick={async () => { if (confirm(t('settings.periods.confirm_delete'))) { await api.delete(`/academic/periods/${params.row.id}`); fetchData(); } }} color="error" size="small"><DeleteIcon /></IconButton>
                </>
            ),
        },
    ];

    const visibleColumns = columns.filter(c => !['nameFr', 'nameAr'].includes(c.field));
    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('periods', visibleColumns);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">{t('settings.periods.title')}</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpen(true)}>{t('settings.periods.add_new')}</Button>
            </Box>

            <DataGrid
                rows={periods}
                columns={persistentColumns}
                onColumnResize={onColumnResize}
                loading={loading}
                autoHeight
                pagination
                sx={{ bgcolor: 'background.paper', borderRadius: 2 }}
            />

            <EnhancedModal open={open} onClose={() => { setOpen(false); setEditingId(null); }} title={editingId ? t('settings.periods.edit_title') : t('settings.periods.create_title')} maxWidth="sm">
                <TextField label={t('settings.periods.code')} fullWidth margin="normal" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                <TextField label={t('settings.periods.name_ar')} fullWidth margin="normal" value={formData.nameAr} onChange={(e) => setFormData({ ...formData, nameAr: e.target.value })} />
                <TextField label={t('settings.periods.name_fr')} fullWidth margin="normal" value={formData.nameFr} onChange={(e) => setFormData({ ...formData, nameFr: e.target.value })} />
                <TextField label={t('settings.periods.start_date')} type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} />
                <TextField label={t('settings.periods.end_date')} type="date" fullWidth margin="normal" InputLabelProps={{ shrink: true }} value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} />
                <FormControl fullWidth margin="normal">
                    <InputLabel>{t('settings.periods.academic_year')}</InputLabel>
                    <Select value={formData.academicYearId} label={t('settings.periods.academic_year')} onChange={(e) => setFormData({ ...formData, academicYearId: e.target.value })}>
                        {years.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
                    </Select>
                </FormControl>
                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSave}>{editingId ? t('common.update') : t('common.create')}</Button>
            </EnhancedModal>
        </Box>
    );
}
