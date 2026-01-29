
'use client';
import { useState, useEffect } from 'react';
import { Box, Typography, Button, Grid, Card, CardContent, IconButton, List, ListItem, ListItemText, Select, MenuItem, FormControl, InputLabel, TextField, Paper, alpha, Chip, Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress, Alert, Divider } from '@mui/material';
import { useTranslations, useLocale } from 'next-intl';
import { api } from '@/lib/api';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { EnhancedModal } from '@/components/common/EnhancedModal';

export default function MajorsPage() {
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
    const [levels, setLevels] = useState<any[]>([]);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [selectedLevel, setSelectedLevel] = useState<any>(null);
    const [selectedMajor, setSelectedMajor] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Modals
    const [openLevelModal, setOpenLevelModal] = useState(false);
    const [openMajorModal, setOpenMajorModal] = useState(false);
    const [openSubjectModal, setOpenSubjectModal] = useState(false);

    // Forms
    const [levelName, setLevelName] = useState('');
    const [majorName, setMajorName] = useState('');
    const [subjectLink, setSubjectLink] = useState({ subjectId: '', coefficient: 2 });

    // Deletion Impact Dialog
    const [impactDialogOpen, setImpactDialogOpen] = useState(false);
    const [impactData, setImpactData] = useState<any>(null);
    const [impactLoading, setImpactLoading] = useState(false);
    const [deletionTarget, setDeletionTarget] = useState<{ type: 'level' | 'major', id: string, name: string } | null>(null);

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [lvlRes, subRes] = await Promise.all([
                api.get('/academic/levels'),
                api.get('/academic/subjects')
            ]);
            const fetchedLevels = lvlRes.data?.data || [];
            setLevels(fetchedLevels);
            setSubjects(subRes.data?.data || []);

            // Re-sync selection if data changed
            if (selectedLevel) {
                const updated = fetchedLevels.find((l: any) => l.id === selectedLevel.id);
                if (updated) {
                    setSelectedLevel(updated);
                    if (selectedMajor) {
                        const updatedMajor = updated.majors?.find((m: any) => m.id === selectedMajor.id);
                        if (updatedMajor) setSelectedMajor(updatedMajor);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLevel = async () => {
        try {
            await api.post('/academic/levels', { name: levelName });
            setLevelName('');
            setOpenLevelModal(false);
            fetchInitialData();
        } catch (error) { console.error(error); }
    };

    const handleCreateMajor = async () => {
        if (!selectedLevel) return;
        try {
            await api.post('/academic/majors', { name: majorName, levelId: selectedLevel.id });
            setMajorName('');
            setOpenMajorModal(false);
            fetchInitialData();
        } catch (error) { console.error(error); }
    };

    const handleAddSubjectToMajor = async () => {
        if (!selectedMajor) return;
        try {
            await api.post('/academic/majors/subject', {
                majorId: selectedMajor.id,
                ...subjectLink
            });
            setSubjectLink({ subjectId: '', coefficient: 2 });
            setOpenSubjectModal(false);
            fetchInitialData();
        } catch (error) { console.error(error); }
    };

    const handleDeleteLevel = async (levelId: string, name: string) => {
        setDeletionTarget({ type: 'level', id: levelId, name });
        setImpactDialogOpen(true);
        setImpactLoading(true);
        try {
            const response = await api.get(`/academic/levels/${levelId}/deletion-impact`);
            setImpactData(response.data?.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error analyzing impact');
            setImpactDialogOpen(false);
        } finally {
            setImpactLoading(false);
        }
    };

    const handleDeleteMajor = async (majorId: string, name: string) => {
        setDeletionTarget({ type: 'major', id: majorId, name });
        setImpactDialogOpen(true);
        setImpactLoading(true);
        try {
            const response = await api.get(`/academic/majors/${majorId}/deletion-impact`);
            setImpactData(response.data?.data);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error analyzing impact');
            setImpactDialogOpen(false);
        } finally {
            setImpactLoading(false);
        }
    };

    const confirmDeletion = async () => {
        if (!deletionTarget) return;
        try {
            const endpoint = deletionTarget.type === 'level'
                ? `/academic/levels/${deletionTarget.id}`
                : `/academic/majors/${deletionTarget.id}`;
            await api.delete(endpoint);

            if (deletionTarget.type === 'level' && selectedLevel?.id === deletionTarget.id) {
                setSelectedLevel(null);
                setSelectedMajor(null);
            } else if (deletionTarget.type === 'major' && selectedMajor?.id === deletionTarget.id) {
                setSelectedMajor(null);
            }

            setImpactDialogOpen(false);
            setDeletionTarget(null);
            setImpactData(null);
            fetchInitialData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error deleting');
        }
    };

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
                <Typography variant="h3" fontWeight="bold" sx={{ fontSize: { xs: '1.8rem', sm: '2.5rem', md: '3rem' } }}>
                    {t('settings.levels_majors.title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => setOpenLevelModal(true)}
                    sx={{ borderRadius: 2, px: 4, width: { xs: '100%', sm: 'auto' } }}
                >
                    {t('settings.levels_majors.new_level')}
                </Button>
            </Box>

            <Box sx={{
                display: 'flex',
                flexDirection: { xs: 'column', lg: 'row' },
                gap: 3,
                alignItems: 'flex-start'
            }}>
                {/* Levels List */}
                <Box sx={{ width: { xs: '100%', lg: 280 }, flexShrink: 0 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            minHeight: { xs: 'auto', lg: '75vh' },
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Typography variant="h5" fontWeight="bold" mb={3} color="primary">{t('settings.levels_majors.levels')}</Typography>
                        {levels.map((lvl) => (
                            <Card
                                key={lvl.id}
                                sx={{
                                    mb: 2,
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    border: selectedLevel?.id === lvl.id ? '2px solid' : '1px solid transparent',
                                    borderColor: 'primary.main',
                                    borderRadius: 2,
                                    '&:hover': {
                                        transform: 'translateY(-2px)',
                                        boxShadow: 3
                                    }
                                }}
                                onClick={() => {
                                    setSelectedLevel(lvl);
                                    setSelectedMajor(null);
                                }}
                            >
                                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box onClick={() => {
                                            setSelectedLevel(lvl);
                                            setSelectedMajor(null);
                                        }} sx={{ flexGrow: 1 }}>
                                            <Typography variant="h6" fontWeight="800">{getLocalizedName(lvl)}</Typography>
                                            <Typography variant="body2" color="text.secondary">
                                                {lvl.majors?.length || 0} {t('menu.majors') || 'spécialités'}
                                            </Typography>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteLevel(lvl.id, getLocalizedName(lvl));
                                            }}
                                            sx={{
                                                color: 'error.main',
                                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: 'error.main',
                                                    color: 'white',
                                                    transform: 'scale(1.1)'
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        ))}
                    </Paper>
                </Box>

                {/* Majors List */}
                <Box sx={{ width: { xs: '100%', lg: 320 }, flexShrink: 0 }}>
                    <Paper
                        elevation={2}
                        sx={{
                            p: 3,
                            borderRadius: 3,
                            minHeight: { xs: 'auto', lg: '75vh' },
                            bgcolor: 'background.paper'
                        }}
                    >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Typography variant="h5" fontWeight="bold" color="secondary">{t('settings.levels_majors.majors')}</Typography>
                                {selectedLevel && (
                                    <Chip
                                        label={getLocalizedName(selectedLevel)}
                                        size="small"
                                        color="secondary"
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                )}
                            </Box>
                            {selectedLevel && (
                                <IconButton color="primary" onClick={() => setOpenMajorModal(true)} sx={{ bgcolor: 'primary.light', color: 'white', '&:hover': { bgcolor: 'primary.main' } }}>
                                    <AddIcon />
                                </IconButton>
                            )}
                        </Box>
                        {selectedLevel ? (
                            selectedLevel.majors?.map((mjr: any) => (
                                <Card
                                    key={mjr.id}
                                    sx={{
                                        mb: 2,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        border: selectedMajor?.id === mjr.id ? '2px solid' : '1px solid transparent',
                                        borderColor: 'secondary.main',
                                        borderRadius: 2,
                                        '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: 3
                                        }
                                    }}
                                >
                                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Typography variant="h6" fontWeight="700" sx={{ flexGrow: 1 }} onClick={() => setSelectedMajor(mjr)}>
                                            {getLocalizedName(mjr)}
                                        </Typography>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteMajor(mjr.id, getLocalizedName(mjr));
                                            }}
                                            sx={{
                                                color: 'error.main',
                                                bgcolor: (theme) => alpha(theme.palette.error.main, 0.1),
                                                '&:hover': {
                                                    bgcolor: 'error.main',
                                                    color: 'white',
                                                    transform: 'scale(1.1)'
                                                },
                                                transition: 'all 0.2s'
                                            }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <Box sx={{ py: 10, textAlign: 'center' }}>
                                <Typography color="text.secondary">{t('settings.levels_majors.select_level_prompt')}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>

                {/* Major Subjects & Coefficients */}
                <Box sx={{ flexGrow: 1, width: '100%' }}>
                    <Paper
                        elevation={4}
                        sx={{
                            p: { xs: 2, sm: 4 },
                            borderRadius: 3,
                            minHeight: '75vh',
                            bgcolor: 'background.paper',
                            border: '1px solid',
                            borderColor: 'divider'
                        }}
                    >
                        <Box sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            justifyContent: 'space-between',
                            alignItems: { xs: 'flex-start', sm: 'center' },
                            mb: 4,
                            gap: 2
                        }}>
                            <Box>
                                <Typography variant="h4" fontWeight="bold" color="success.main">{t('settings.levels_majors.subjects_coeff')}</Typography>
                                {selectedLevel && selectedMajor && (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                                        <Typography variant="body1" color="text.secondary" fontWeight="500">{getLocalizedName(selectedLevel)}</Typography>
                                        <Typography variant="body1" color="text.secondary">{' > '}</Typography>
                                        <Typography variant="body1" color="success.main" fontWeight="bold">{getLocalizedName(selectedMajor)}</Typography>
                                    </Box>
                                )}
                            </Box>
                            {selectedMajor && (
                                <Button
                                    variant="contained"
                                    color="success"
                                    startIcon={<AddIcon />}
                                    onClick={() => setOpenSubjectModal(true)}
                                    sx={{ borderRadius: 2, px: 4, width: { xs: '100%', sm: 'auto' } }}
                                >
                                    {t('settings.levels_majors.add_subject')}
                                </Button>
                            )}
                        </Box>
                        {selectedMajor ? (
                            <List sx={{ width: '100%' }}>
                                {selectedMajor.subjects?.map((ms: any) => (
                                    <ListItem
                                        key={ms.id}
                                        divider
                                        sx={{
                                            py: 2.5,
                                            flexDirection: { xs: 'column', sm: 'row' },
                                            alignItems: { xs: 'flex-start', sm: 'center' },
                                            gap: 2
                                        }}
                                    >
                                        <ListItemText
                                            primary={
                                                <Typography variant="h6" fontWeight="700">
                                                    {getLocalizedName(ms.subject)}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box sx={{ display: 'flex', gap: 2, mt: 0.5 }}>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Code: <strong>{ms.subject?.code}</strong>
                                                    </Typography>
                                                    <Typography variant="body2" color="success.main" fontWeight="bold">
                                                        Coeff: {ms.coefficient}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                        <Box sx={{
                                            display: 'flex',
                                            ml: { xs: 0, sm: 'auto' },
                                            width: { xs: '100%', sm: 'auto' },
                                            justifyContent: { xs: 'flex-start', sm: 'flex-end' },
                                            gap: 1
                                        }}>
                                            <IconButton
                                                edge="end"
                                                aria-label="edit"
                                                onClick={() => {
                                                    setSubjectLink({ subjectId: ms.subjectId, coefficient: ms.coefficient });
                                                    setOpenSubjectModal(true);
                                                }}
                                                sx={{
                                                    mr: 2,
                                                    color: 'primary.main',
                                                    bgcolor: (theme) => alpha(theme.palette.primary.main, 0.08),
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'primary.main',
                                                        color: 'white',
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                <EditIcon fontSize="medium" />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                aria-label="delete"
                                                onClick={async () => {
                                                    if (confirm(t('settings.levels_majors.confirm_remove_subject'))) {
                                                        try {
                                                            await api.delete(`/academic/majors/${selectedMajor.id}/subjects/${ms.subjectId}`);
                                                            fetchInitialData();
                                                        } catch (error) { console.error(error); }
                                                    }
                                                }}
                                                sx={{
                                                    color: 'error.main',
                                                    bgcolor: (theme) => alpha(theme.palette.error.main, 0.08),
                                                    transition: 'all 0.2s',
                                                    '&:hover': {
                                                        bgcolor: 'error.main',
                                                        color: 'white',
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            >
                                                <DeleteIcon fontSize="medium" />
                                            </IconButton>
                                        </Box>
                                    </ListItem>
                                ))}
                                {(!selectedMajor.subjects || selectedMajor.subjects.length === 0) && (
                                    <Box sx={{ py: 20, textAlign: 'center' }}>
                                        <Typography variant="h6" color="text.secondary">{t('classes.no_subjects')}</Typography>
                                    </Box>
                                )}
                            </List>
                        ) : (
                            <Box sx={{ py: 20, textAlign: 'center' }}>
                                <Typography variant="h6" color="text.secondary">{t('settings.levels_majors.select_major_prompt')}</Typography>
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>

            {/* Modals */}
            <EnhancedModal open={openLevelModal} onClose={() => setOpenLevelModal(false)} title={t('settings.levels_majors.create_level')} onConfirm={handleCreateLevel}>
                <TextField fullWidth label={t('settings.levels_majors.level_name_placeholder')} value={levelName} onChange={(e) => setLevelName(e.target.value)} />
            </EnhancedModal>

            <EnhancedModal open={openMajorModal} onClose={() => setOpenMajorModal(false)} title={t('settings.levels_majors.create_major')} onConfirm={handleCreateMajor}>
                <TextField fullWidth label={t('settings.levels_majors.major_name_placeholder')} value={majorName} onChange={(e) => setMajorName(e.target.value)} />
            </EnhancedModal>

            <EnhancedModal
                open={openSubjectModal}
                onClose={() => {
                    setOpenSubjectModal(false);
                    setSubjectLink({ subjectId: '', coefficient: 2 }); // Reset
                }}
                title={subjectLink.subjectId && subjects.find(s => s.id === subjectLink.subjectId) ? t('settings.levels_majors.update_coeff') : t('settings.levels_majors.add_subject')}
                onConfirm={handleAddSubjectToMajor}
                confirmText={subjectLink.subjectId && subjects.find(s => s.id === subjectLink.subjectId) ? t('common.update') : t('common.create')}
            >
                <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel id="sub-select-label">{t('labels.subject')}</InputLabel>
                    <Select
                        labelId="sub-select-label"
                        value={subjectLink.subjectId}
                        label={t('labels.subject')}
                        onChange={(e) => setSubjectLink({ ...subjectLink, subjectId: e.target.value })}
                        disabled={!!(selectedMajor?.subjects?.find((s: any) => s.subjectId === subjectLink.subjectId) && openSubjectModal)} // Disable if it looks like we opened it with a pre-filled ID (heuristic or use explicit state)
                    >
                        {subjects.map(s => <MenuItem key={s.id} value={s.id}>{getLocalizedName(s)}</MenuItem>)}
                    </Select>
                </FormControl>
                <TextField fullWidth type="number" label={t('classes.coeff')} value={subjectLink.coefficient} onChange={(e) => setSubjectLink({ ...subjectLink, coefficient: Number(e.target.value) })} />
            </EnhancedModal>

            {/* Deletion Impact Dialog */}
            <Dialog
                open={impactDialogOpen}
                onClose={() => {
                    setImpactDialogOpen(false);
                    setDeletionTarget(null);
                    setImpactData(null);
                }}
                maxWidth="sm"
                fullWidth
            >
                <DialogTitle>
                    {t('settings.levels_majors.deletion_impact.title')}
                </DialogTitle>
                <DialogContent>
                    {impactLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                            <CircularProgress size={24} sx={{ mr: 2 }} />
                            <Typography>{t('settings.levels_majors.deletion_impact.loading')}</Typography>
                        </Box>
                    ) : impactData ? (
                        <Box sx={{ pt: 1 }}>
                            {/* Main Question */}
                            <Typography variant="body1" sx={{ mb: 3 }}>
                                {deletionTarget?.type === 'level'
                                    ? t('settings.levels_majors.deletion_impact.confirm_delete_level').replace('{name}', deletionTarget?.name || '')
                                    : t('settings.levels_majors.deletion_impact.confirm_delete_major').replace('{name}', deletionTarget?.name || '')
                                }
                            </Typography>

                            {/* Blocker - Cannot Delete */}
                            {impactData.grades > 0 ? (
                                <Alert severity="error" sx={{ mb: 2 }}>
                                    <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
                                        {t('settings.levels_majors.deletion_impact.cannot_delete_has_grades')}
                                    </Typography>
                                    <Typography variant="body2" sx={{ mb: 1 }}>
                                        {t('settings.levels_majors.deletion_impact.grades_warning')
                                            .replace('{count}', impactData.classes)
                                            .replace('{type}', t(`settings.levels_majors.deletion_impact.${deletionTarget?.type}`))}
                                    </Typography>
                                    <Typography variant="body2">
                                        {t('settings.levels_majors.deletion_impact.must_delete_grades_first')
                                            .replace('{type}', t(`settings.levels_majors.deletion_impact.${deletionTarget?.type}`))}
                                    </Typography>
                                </Alert>
                            ) : (
                                <>
                                    {/* What will be deleted */}
                                    {(impactData.majors > 0 || impactData.classes > 0) && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                                                {t('settings.levels_majors.deletion_impact.this_will_delete')}
                                            </Typography>
                                            <Box component="ul" sx={{ m: 0, pl: 3 }}>
                                                {deletionTarget?.type === 'level' && impactData.majors > 0 && (
                                                    <li>
                                                        <Typography variant="body2">
                                                            {t('settings.levels_majors.deletion_impact.majors_count').replace('{count}', impactData.majors)}
                                                        </Typography>
                                                    </li>
                                                )}
                                                {impactData.classes > 0 && (
                                                    <li>
                                                        <Typography variant="body2">
                                                            {t('settings.levels_majors.deletion_impact.classes_count').replace('{count}', impactData.classes)}
                                                        </Typography>
                                                    </li>
                                                )}
                                            </Box>
                                        </Box>
                                    )}

                                    {/* Students warning */}
                                    {impactData.students > 0 && (
                                        <Alert severity="warning" sx={{ mb: 2 }}>
                                            <Typography variant="body2">
                                                ⚠️ {t('settings.levels_majors.deletion_impact.students_will_lose_class').replace('{count}', impactData.students)}
                                            </Typography>
                                        </Alert>
                                    )}
                                </>
                            )}
                        </Box>
                    ) : null}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setImpactDialogOpen(false);
                            setDeletionTarget(null);
                            setImpactData(null);
                        }}
                    >
                        {t('settings.levels_majors.deletion_impact.cancel')}
                    </Button>
                    {impactData && impactData.canDelete && (
                        <Button
                            onClick={confirmDeletion}
                            variant="contained"
                            color="error"
                            startIcon={<DeleteIcon />}
                        >
                            {t('settings.levels_majors.deletion_impact.understand_and_continue')}
                        </Button>
                    )}
                </DialogActions>
            </Dialog>
        </Box >
    );
}
