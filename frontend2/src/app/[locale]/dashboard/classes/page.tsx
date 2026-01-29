
'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, TextField, FormControl, InputLabel, Select, MenuItem, IconButton, Table, TableHead, TableRow, TableCell, TableBody, Paper, Grid, useTheme, useMediaQuery, alpha } from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SettingsIcon from '@mui/icons-material/Settings';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { EnhancedModal } from '@/components/common/EnhancedModal';
import { api } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { excelUtil } from '@/utils/excel';
import { useDataGridPersistence } from '@/hooks/useDataGridPersistence';
import { GridRowSelectionModel, GridColumnResizeParams } from '@mui/x-data-grid';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function ClassesPage() {
    const t = useTranslations();
    const [classes, setClasses] = useState<any[]>([]);
    const [years, setYears] = useState<any[]>([]);
    const [levels, setLevels] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [teachers, setTeachers] = useState<any[]>([]);
    const [students, setStudents] = useState<any[]>([]);

    // Bulk Selection State
    const [selectionModel, setSelectionModel] = useState<any>([]);

    const [openCreate, setOpenCreate] = useState(false);
    const [selectedLevelId, setSelectedLevelId] = useState('');
    const [newClass, setNewClass] = useState({ suffix: '', majorId: '', academicYearId: '' });
    const [editingClassId, setEditingClassId] = useState<string | null>(null);

    const [selectedClass, setSelectedClass] = useState<any | null>(null);
    const [openManage, setOpenManage] = useState(false);
    const [linkData, setLinkData] = useState({ subjectId: '', coefficient: 2, teacherId: '' });
    const [editingSubject, setEditingSubject] = useState<string | null>(null);

    const [openStudents, setOpenStudents] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState('');

    const [loading, setLoading] = useState(false);
    const [actionLoading, setActionLoading] = useState(false);

    const locale = useLocale();

    // Helper for localized names with fallback
    const getLocalizedName = (item: any) => {
        if (!item) return '';
        const nameMap: any = {
            ar: item.nameAr,
            fr: item.nameFr,
            en: item.nameEn,
            tam: item.nameTam || item.nameZgh, // Handled both variants
            tr: item.nameTr,
            de: item.nameDe
        };
        return nameMap[locale] || item.nameEn || item.nameFr || item.nameAr || item.name || item.id;
    };

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            const [classesRes, yearsRes, levelsRes, subjectsRes, teachersRes, studentsRes] = await Promise.all([
                api.get('/academic/classes'),
                api.get('/academic/years'),
                api.get('/academic/levels'),
                api.get('/academic/subjects'),
                api.get('/users/teachers'),
                api.get('/users/students')
            ]);
            setClasses(classesRes.data?.data || []);
            setYears(yearsRes.data?.data || []);
            setLevels(levelsRes.data?.data || []);
            setSubjects(subjectsRes.data?.data || []);
            setTeachers(teachersRes.data?.data || []);
            setStudents(studentsRes.data?.data || []);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveClass = async () => {
        try {
            setActionLoading(true);
            // Find level name to construct the full name (e.g., "1AS A")
            const level = levels.find(l => l.id === selectedLevelId);
            const fullName = level ? `${level.name} ${newClass.suffix}` : newClass.suffix;

            const payload = {
                name: fullName,
                majorId: newClass.majorId,
                academicYearId: newClass.academicYearId
            };

            if (editingClassId) {
                await api.put(`/academic/classes/${editingClassId}`, payload);
            } else {
                await api.post('/academic/classes', payload);
            }
            setOpenCreate(false);
            setNewClass({ suffix: '', majorId: '', academicYearId: '' });
            setSelectedLevelId('');
            setEditingClassId(null);
            fetchAllData();
        } catch (error) {
            console.error('Error saving class:', error);
        } finally {
            setActionLoading(false);
        }
    };

    const handleEditClass = (cls: any) => {
        setSelectedLevelId(cls.major?.levelId || '');
        // Extract suffix if it follows the "Level Suffix" pattern
        const levelName = cls.major?.level?.name || '';
        const nameSuffix = levelName && cls.name.startsWith(levelName)
            ? cls.name.replace(levelName, '').trim()
            : cls.name;

        setNewClass({
            suffix: nameSuffix,
            majorId: cls.majorId || '',
            academicYearId: cls.academicYearId || ''
        });
        setEditingClassId(cls.id);
        setOpenCreate(true);
    };

    const handleDeleteClass = async (id: string) => {
        if (confirm(t('classes.delete') + '?')) {
            try {
                await api.delete(`/academic/classes/${id}`);
                fetchAllData();
            } catch (error) {
                console.error('Error deleting class:', error);
            }
        }
    };

    const handleManageSubjects = async (cls: any) => {
        const res = await api.get(`/academic/classes/${cls.id}`);
        setSelectedClass(res.data?.data || cls);
        setOpenManage(true);
    };

    const handleAddSubjectToClass = async () => {
        if (!selectedClass || !linkData.subjectId) return;
        try {
            await api.post(`/academic/classes/subject/${selectedClass.id}`, linkData);
            setLinkData({ subjectId: '', coefficient: 2, teacherId: '' });
            setEditingSubject(null);
            const res = await api.get(`/academic/classes/${selectedClass.id}`);
            setSelectedClass(res.data?.data);
        } catch (error) {
            console.error('Error adding subject:', error);
        }
    };

    const handleRemoveSubject = async (subjectId: string) => {
        if (!selectedClass) return;
        try {
            await api.delete(`/academic/classes/subject/${selectedClass.id}/${subjectId}`);
            const res = await api.get(`/academic/classes/${selectedClass.id}`);
            setSelectedClass(res.data?.data);
        } catch (error) {
            console.error('Error removing subject:', error);
        }
    };

    // Bulk Operations
    const handleBulkDelete = async () => {
        if (!selectionModel.length) return;
        if (!confirm(`${t('classes.delete')} ${selectionModel.length} items?`)) return;
        try {
            setActionLoading(true);
            // Note: Adjust payload structure based on your backend expectation.
            // Assuming backend expects { ids: [...] } or just array in body.
            // Using "data" property for axios delete body.
            const res = await api.delete('/academic/classes/bulk', { data: { ids: selectionModel } });
            if (res.status === 200 || res.status === 201) {
                setSelectionModel([]);
                fetchAllData();
            }
        } catch (error) { console.error(error); }
        finally { setActionLoading(false); }
    };

    const handleExportClasses = () => {
        const dataToExport = classes.map(c => ({
            Name: c.name,
            Level: c.major?.level?.name || '-',
            Major: c.major?.name || '-',
            Year: years.find(y => y.id === c.academicYearId)?.name || '-',
            Subjects: c.subjects?.length || 0,
            Students: c.students?.length || 0
        }));
        excelUtil.export(dataToExport, "classes_list", "Classes");
    };

    const handleImportExcel = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        excelUtil.import(file, async (data) => {
            const mapped = excelUtil.mapData(data, {
                'Name': 'name',
                'Level': 'level',
                'Major': 'major'
                // Add more mappings if needed for creation, or assume simple structure
            }).filter(c => c.name);

            // Note: Complex logic might be needed here to resolve Level/Major IDs from names
            // For now, assuming backend can handle raw data or we leave it as a placeholder for advanced implementation.
            // If the backend expects IDs, we would need to look them up here. 
            // For safety, let's just log or implement a basic version if backend allows.

            if (mapped.length > 0) {
                try {
                    setActionLoading(true);
                    const res = await api.post('/academic/classes/bulk', { classes: mapped });
                    if (res.status === 200 || res.status === 201) fetchAllData();
                } catch (e) { console.error(e); }
                finally { setActionLoading(false); }
            }
        });
    };

    const handleManageStudents = async (cls: any) => {
        const res = await api.get(`/academic/classes/${cls.id}`);
        setSelectedClass(res.data?.data || cls);
        setOpenStudents(true);
    };

    const handleAddStudent = async () => {
        if (!selectedClass || !selectedStudentId) return;
        try {
            await api.post(`/academic/classes/student/${selectedClass.id}/${selectedStudentId}`);
            setSelectedStudentId('');
            // Refresh Selected Class to update the modal list
            const res = await api.get(`/academic/classes/${selectedClass.id}`);
            setSelectedClass(res.data?.data);
            // Refresh All Data to update the main grid counts and the available students list (global state)
            fetchAllData();
        } catch (error) {
            console.error('Error adding student:', error);
        }
    };

    const handleRemoveStudent = async (studentId: string) => {
        if (!selectedClass) return;
        try {
            await api.delete(`/academic/classes/student/${selectedClass.id}/${studentId}`);
            // Refresh Selected Class
            const res = await api.get(`/academic/classes/${selectedClass.id}`);
            setSelectedClass(res.data?.data);
            // Refresh Global Data
            fetchAllData();
        } catch (error) {
            console.error('Error removing student:', error);
        }
    };

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    const columns: GridColDef[] = [
        {
            field: 'name',
            headerName: t('classes.name'),
            flex: 1,
            minWidth: 150,
            valueGetter: (value, row) => row.name // Now name holds "Level Suffix"
        },
        {
            field: 'level',
            headerName: t('classes.level'),
            width: 100,
            valueGetter: (value, row) => row?.major?.level?.name || '-',
            hideable: true
        },
        {
            field: 'major',
            headerName: 'Spécialité',
            width: 150,
            valueGetter: (value, row) => row?.major?.name || '-',
            hideable: true
        },
        {
            field: 'year',
            headerName: t('classes.year'),
            width: 100,
            valueGetter: (value, row) => {
                if (!row) return '';
                return years.find(y => y.id === row.academicYearId)?.name || '';
            },
            hideable: true
        },
        {
            field: 'subjectsCount',
            headerName: t('classes.subjects_and_coeff'),
            width: 70,
            valueGetter: (value, row) => row?.subjects?.length || 0
        },
        {
            field: 'studentsCount',
            headerName: t('common.students'),
            width: 70,
            valueGetter: (value, row) => row?.students?.length || 0
        },
        {
            field: 'actions',
            headerName: t('classes.actions'),
            width: 160,
            sortable: false,
            filterable: false,
            renderCell: (params) => (
                <Box sx={{ display: 'flex' }}>
                    <IconButton onClick={() => handleEditClass(params.row)} color="primary" size="small">
                        <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleManageSubjects(params.row)} color="info" size="small">
                        <SettingsIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleManageStudents(params.row)} color="success" size="small">
                        <PersonAddIcon fontSize="small" />
                    </IconButton>
                    <IconButton onClick={() => handleDeleteClass(params.row.id)} color="error" size="small">
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Box>
            ),
        },
    ];

    // Filter columns for mobile
    const visibleColumns = columns.filter(col => {
        if (isMobile) {
            return ['name', 'actions'].includes(col.field);
        }
        if (isTablet) {
            return ['name', 'level', 'studentsCount', 'actions'].includes(col.field);
        }
        return true;
    });

    const { columns: persistentColumns, onColumnResize } = useDataGridPersistence('classes', visibleColumns);

    const availableSubjects = subjects.filter(s =>
        !selectedClass?.subjects?.some((cs: any) => cs.subjectId === s.id)
    );

    const availableStudents = students.filter(s =>
        !s.classId && // Only students not affected to any class
        !selectedClass?.students?.some((st: any) => st.id === s.id)
    );

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
                <Typography variant="h4" fontWeight="bold">{t('menu.classes')}</Typography>
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
                    <Button variant="outlined" startIcon={<FileDownloadIcon />} onClick={handleExportClasses} disabled={actionLoading} sx={{ flex: { xs: 1, sm: 'none' } }}>
                        {t('common.export')}
                    </Button>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenCreate(true)} disabled={actionLoading} sx={{ width: { xs: '100%', sm: 'auto' } }}>
                        {t('classes.new_class')}
                    </Button>
                </Box>
            </Box>

            <Box sx={{ height: 600, width: '100%', bgcolor: 'background.paper', borderRadius: 2, overflow: 'hidden' }}>
                <DataGrid
                    rows={classes}
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

            {/* Create/Edit Class Modal */}
            <EnhancedModal
                open={openCreate}
                onClose={() => {
                    setOpenCreate(false);
                    setNewClass({ suffix: '', majorId: '', academicYearId: '' });
                    setSelectedLevelId('');
                    setEditingClassId(null);
                }}
                title={editingClassId ? t('common.update') : t('classes.new_class')}
                maxWidth="sm"
            >
                <TextField
                    label={t('classes.suffix_helper')}
                    fullWidth
                    margin="normal"
                    value={newClass.suffix}
                    onChange={(e) => setNewClass({ ...newClass, suffix: e.target.value })}
                />

                <FormControl fullWidth margin="normal">
                    <InputLabel>{t('labels.level')}</InputLabel>
                    <Select
                        value={selectedLevelId}
                        label={t('labels.level')}
                        onChange={(e) => {
                            setSelectedLevelId(e.target.value);
                            setNewClass({ ...newClass, majorId: '' });
                        }}
                    >
                        {levels.map(l => <MenuItem key={l.id} value={l.id}>{getLocalizedName(l)}</MenuItem>)}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal" disabled={!selectedLevelId}>
                    <InputLabel>{t('labels.major')}</InputLabel>
                    <Select
                        value={newClass.majorId}
                        label={t('labels.major')}
                        onChange={(e) => setNewClass({ ...newClass, majorId: e.target.value })}
                    >
                        {levels.find(l => l.id === selectedLevelId)?.majors?.map((m: any) => (
                            <MenuItem key={m.id} value={m.id}>{getLocalizedName(m)}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl fullWidth margin="normal">
                    <InputLabel>{t('classes.year')}</InputLabel>
                    <Select value={newClass.academicYearId} label={t('classes.year')} onChange={(e) => setNewClass({ ...newClass, academicYearId: e.target.value })}>
                        {years.map(y => <MenuItem key={y.id} value={y.id}>{y.name}</MenuItem>)}
                    </Select>
                </FormControl>

                <Button variant="contained" fullWidth sx={{ mt: 2 }} onClick={handleSaveClass} disabled={actionLoading}>
                    {actionLoading ? t('classes.saving') : (editingClassId ? t('common.update') : t('common.create'))}
                </Button>
            </EnhancedModal>

            {/* Manage Subjects Modal */}
            <EnhancedModal
                open={openManage}
                onClose={() => setOpenManage(false)}
                title={`${t('classes.manage_subjects')} - ${selectedClass?.name}`}
                maxWidth="md"
            >
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p: 2, bgcolor: (theme) => alpha(theme.palette.info.main, 0.05) }}>
                            <Typography variant="subtitle2" color="info.main">
                                {t('classes.inherited_subjects_hint', { major: getLocalizedName(selectedClass?.major) })}
                            </Typography>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>{t('bulletin.subject')}</TableCell><TableCell>{t('classes.coeff')}</TableCell><TableCell>{t('classes.teacher')}</TableCell><TableCell align="right">{t('classes.actions')}</TableCell></TableRow></TableHead>
                            <TableBody>
                                {selectedClass?.subjects?.map((cs: any) => (
                                    <TableRow key={cs.id}>
                                        <TableCell>{cs.subject?.nameFr} ({cs.subject?.code})</TableCell>
                                        <TableCell>{cs.coefficient}</TableCell>
                                        <TableCell>
                                            <FormControl fullWidth size="small">
                                                <Select
                                                    value={cs.teacherId || ''}
                                                    onChange={async (e) => {
                                                        const teacherId = e.target.value;
                                                        await api.put(`/academic/classes/subject/${selectedClass.id}/${cs.subjectId}`, {
                                                            teacherId,
                                                            coefficient: cs.coefficient
                                                        });
                                                        handleManageSubjects(selectedClass);
                                                    }}
                                                >
                                                    <MenuItem value=""><em>{t('classes.unassigned')}</em></MenuItem>
                                                    {teachers.map(t => <MenuItem key={t.id} value={t.id}>{t.username}</MenuItem>)}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell align="right">
                                            {/* Suppression désactivée car héritée */}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            </EnhancedModal>

            {/* Manage Students Modal */}
            <EnhancedModal
                open={openStudents}
                onClose={() => setOpenStudents(false)}
                title={`${t('classes.manage_students')} - ${selectedClass?.name}`}
                maxWidth="md"
            >
                <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid size={{ xs: 12 }}>
                        <Paper variant="outlined" sx={{ p: 2 }}>
                            <Typography variant="subtitle2" gutterBottom color="primary">{t('classes.add_student')}</Typography>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel>{t('classes.select_student')}</InputLabel>
                                    <Select value={selectedStudentId} label={t('classes.select_student')} onChange={(e) => setSelectedStudentId(e.target.value)}>
                                        {availableStudents.map(s => <MenuItem key={s.id} value={s.id}>{s.username}</MenuItem>)}
                                    </Select>
                                </FormControl>
                                <Button variant="contained" onClick={handleAddStudent} disabled={!selectedStudentId}>{t('classes.add_student')}</Button>
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12 }}>
                        <Table size="small">
                            <TableHead><TableRow><TableCell>{t('common.students')}</TableCell><TableCell align="right">{t('classes.actions')}</TableCell></TableRow></TableHead>
                            <TableBody>
                                {selectedClass?.students?.map((s: any) => (
                                    <TableRow key={s.id}>
                                        <TableCell>
                                            <Typography variant="body2">{s.username}</Typography>
                                            <Typography variant="caption" color="textSecondary">{s.email}</Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <IconButton size="small" color="error" onClick={() => handleRemoveStudent(s.id)}><DeleteIcon fontSize="small" /></IconButton>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Grid>
                </Grid>
            </EnhancedModal>
        </Box>
    );
}
