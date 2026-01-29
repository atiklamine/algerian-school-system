'use client';

import { useEffect, useState } from 'react';
import { Box, Typography, Select, MenuItem, Button, Table, TableHead, TableRow, TableCell, TableBody, TextField } from '@mui/material';
import { api } from '@/lib/api';
import { useTranslations, useLocale } from 'next-intl';
import { useRequestContext } from '@/components/common/RequestProvider';

function decodeTokenUserId() {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    try {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        return decoded?.id || null;
    } catch (e) { return null; }
}

export default function GradingPage() {
    const t = useTranslations();
    const locale = useLocale();

    const [classes, setClasses] = useState<any[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>('');
    const [selectedClass, setSelectedClass] = useState<any | null>(null);
    const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
    const [gradesMap, setGradesMap] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const { show, hide } = useRequestContext();

    useEffect(() => { fetchClasses(); }, []);

    const fetchClasses = async () => {
        try {
            setLoading(true);
            const res = await api.get('/academic/classes');
            setClasses(res.data?.data || []);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    const handleSelectClass = async (id: string) => {
        setSelectedClassId(id);
        if (!id) { setSelectedClass(null); return; }
        try {
            show((t('grading.select_class') || 'Loading class...') as string);
            const res = await api.get(`/academic/classes/${id}`);
            setSelectedClass(res.data?.data || null);
            // default to first subject
            const firstSub = res.data?.data?.subjects?.[0]?.subject;
            setSelectedSubjectId(firstSub?.id || '');
            // prepare grades map
            const map: Record<string,string> = {};
            (res.data?.data?.students || []).forEach((s: any) => { map[s.id] = ''; });
            setGradesMap(map);
        } catch (e) { console.error(e); }
        finally { hide(); }
    };

    const handleGradeChange = (studentId: string, value: string) => {
        setGradesMap(prev => ({ ...prev, [studentId]: value }));
    };

    const handleSubmit = async () => {
        if (!selectedClass || !selectedSubjectId) return;
        const teacherId = decodeTokenUserId();
        const entries = Object.entries(gradesMap).filter(([_, v]) => v !== '' && v !== null && v !== undefined);
        if (entries.length === 0) return alert('No grades to submit');

        try {
            show((t('grading.submit') || 'Submitting grades...') as string);
            for (const [studentId, gradeStr] of entries) {
                const gradeVal = Number(gradeStr);
                if (isNaN(gradeVal)) continue;
                await api.post('/academic/grades', {
                    studentId,
                    teacherId,
                    subjectId: selectedSubjectId,
                    grade: gradeVal,
                    coefficient: 1
                });
            }
            alert('Grades submitted');
            // refresh class data
            handleSelectClass(selectedClassId);
        } catch (e) { console.error(e); alert('Failed to submit grades'); }
        finally { hide(); setLoading(false); }
    };

    return (
        <Box sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>{t('grading.title') || 'Grading'}</Typography>

            <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Select value={selectedClassId} onChange={(e) => handleSelectClass(String(e.target.value))} displayEmpty sx={{ minWidth: 240 }}>
                    <MenuItem value="">{t('grading.select_class') || 'Select Class'}</MenuItem>
                    {classes.map(c => (
                        <MenuItem key={c.id} value={c.id}>{c.name} - {c.major?.name}</MenuItem>
                    ))}
                </Select>

                <Select value={selectedSubjectId} onChange={(e) => setSelectedSubjectId(String(e.target.value))} displayEmpty sx={{ minWidth: 240 }}>
                    <MenuItem value="">{t('grading.select_subject') || 'Select Subject'}</MenuItem>
                    {selectedClass?.subjects?.map((cs: any) => (
                        <MenuItem key={cs.subjectId} value={cs.subjectId}>{cs.subject?.nameFr || cs.subject?.nameEn || cs.subject?.nameAr}</MenuItem>
                    ))}
                </Select>

                <Button variant="contained" onClick={handleSubmit} disabled={loading || !selectedSubjectId}>{t('grading.submit') || 'Submit'}</Button>
            </Box>

            <Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>{t('grading.student') || 'Student'}</TableCell>
                            <TableCell>{t('grading.grade') || 'Grade'}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {selectedClass?.students?.map((s: any) => (
                            <TableRow key={s.id}>
                                <TableCell>{s.username} ({s.email})</TableCell>
                                <TableCell>
                                    <TextField size="small" value={gradesMap[s.id] ?? ''} onChange={(e) => handleGradeChange(s.id, e.target.value)} placeholder="0-20" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Box>
        </Box>
    );
}
