'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Paper, Alert, CircularProgress, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridToolbar, GridRenderCellParams } from '@mui/x-data-grid';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import SchoolIcon from '@mui/icons-material/School';

interface Grade {
    id: string;
    value: number;
    studentId: string;
    coefficient: number;
    subject: {
        nameFr: string;
        nameAr: string;
        code: string;
    };
    examTypeRef?: {
        nameFr: string;
        nameAr: string;
    };
    periodRef?: {
        nameFr: string;
        nameAr: string;
    };
    // Legacy support
    examType?: string;
    period?: string;
}

export default function MyGradesPage() {
    const t = useTranslations();
    const [grades, setGrades] = useState<Grade[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchGrades();
    }, []);

    const fetchGrades = async () => {
        try {
            setLoading(true);
            const response = await api.get('/grades/my');

            if (response.data.success) {
                setGrades(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch grades:', err);
            setError('Failed to load grades. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const columns: GridColDef[] = [
        {
            field: 'subject',
            headerName: t('common.subjects'),
            flex: 1,
            valueGetter: (params: any) => params.row?.subject?.nameFr || '-'
        },
        {
            field: 'examType',
            headerName: t('settings.exam_types.title'),
            flex: 1,
            valueGetter: (params: any) => params.row?.examTypeRef?.nameFr || params.row?.examType || '-'
        },
        {
            field: 'period',
            headerName: t('settings.periods.title'),
            flex: 1,
            valueGetter: (params: any) => params.row?.periodRef?.nameFr || params.row?.period || '-'
        },
        {
            field: 'value',
            headerName: t('grading.grade'),
            flex: 1,
            renderCell: (params: GridRenderCellParams) => (
                <Chip
                    label={params.value}
                    color={params.value >= 10 ? 'success' : 'error'}
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                />
            )
        },
        {
            field: 'coefficient',
            headerName: t('classes.coeff'),
            flex: 0.5,
            valueGetter: (params: any) => params.row?.coefficient || 1
        },
    ];

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
                <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                    <Typography variant="h4" fontWeight="bold" color="primary">
                        {t('menu.my_grades')}
                    </Typography>
                    <Typography color="text.secondary">
                        View your academic performance
                    </Typography>
                </Box>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

            <Paper sx={{ height: 600, width: '100%', p: 2 }}>
                <DataGrid
                    rows={grades}
                    columns={columns}
                    slots={{ toolbar: GridToolbar }}
                    disableRowSelectionOnClick
                    initialState={{
                        pagination: { paginationModel: { pageSize: 10 } },
                    }}
                    pageSizeOptions={[10, 25, 50]}
                />
            </Paper>
        </Box>
    );
}
