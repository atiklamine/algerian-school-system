import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import {
    createAcademicYear, getAcademicYears, updateAcademicYear, deleteAcademicYear, bulkCreateAcademicYears, bulkDeleteAcademicYears,
    createSubject, getSubjects, bulkCreateSubjects, bulkDeleteSubjects, updateSubject,
    createClass, getClasses, getClass, deleteClass, getClassesForTeacher, bulkCreateClasses, bulkDeleteClasses, updateClass,
    addSubjectToClass, removeSubjectFromClass, updateClassSubject,
    addStudentToClass, getClassStudents, removeStudentFromClass,
    createGrade, getGradesByStudent, getMyGrades, getStudentBulletin, getDashboardStats
} from './controller';
import {
    getExamTypes, createExamType, updateExamType, deleteExamType,
    getPeriods, createPeriod, updatePeriod, deletePeriod
} from './exam-config.controller';
import {
    getLevels, createLevel, deleteLevel, analyzeLevelDeletionImpact, getMajors, createMajor, deleteMajor, analyzeMajorDeletionImpact, addSubjectToMajor, getMajorSubjects, removeSubjectFromMajor
} from './major.controller';
import { exportClassGrades } from './controller';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Statistics
router.get('/stats', getDashboardStats);

// Academic Years
router.post('/years', createAcademicYear);
router.get('/years', getAcademicYears);
router.post('/years/bulk', bulkCreateAcademicYears);
router.put('/years/:id', updateAcademicYear);
router.delete('/years/:id', deleteAcademicYear);
router.delete('/years/bulk', bulkDeleteAcademicYears);

// Subjects
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.get('/subjects', getSubjects);
router.post('/subjects/bulk', bulkCreateSubjects);
router.delete('/subjects/bulk', bulkDeleteSubjects);

// Classes
router.post('/classes', createClass);
router.put('/classes/:id', updateClass);
router.get('/classes', getClasses);
router.get('/classes/:id', getClass);
router.post('/classes/bulk', bulkCreateClasses);
router.get('/classes/teacher/:teacherId', getClassesForTeacher);
router.delete('/classes/:id', deleteClass);
router.delete('/classes/bulk', bulkDeleteClasses);
router.post('/classes/subject', addSubjectToClass);
router.post('/classes/subject/:classId', addSubjectToClass);
router.put('/classes/subject/:classId/:subjectId', updateClassSubject);
router.delete('/classes/subject/:classId/:subjectId', removeSubjectFromClass);

// Students
router.get('/classes/:classId/students', getClassStudents);
router.post('/classes/student', addStudentToClass);
router.post('/classes/student/:classId/:studentId', addStudentToClass);
router.delete('/classes/student/:studentId', removeStudentFromClass);
router.delete('/classes/student/:classId/:studentId', removeStudentFromClass);

// Grades
router.post('/grades', createGrade);
router.get('/grades/my', getMyGrades); // Must come before :studentId to avoid conflict if logic were different, though here it is distinct path
router.get('/grades/student/:studentId', getGradesByStudent);
router.get('/bulletins/:studentId/:period', getStudentBulletin);

// Exam Types Configuration
router.get('/exam-types', getExamTypes);
router.post('/exam-types', createExamType);
router.put('/exam-types/:id', updateExamType);
router.delete('/exam-types/:id', deleteExamType);

// Periods Configuration
router.get('/periods', getPeriods);
router.post('/periods', createPeriod);
router.put('/periods/:id', updatePeriod);
router.delete('/periods/:id', deletePeriod);

// Levels & Majors
router.get('/levels', getLevels);
router.post('/levels', createLevel);
router.get('/levels/:id/deletion-impact', analyzeLevelDeletionImpact);
router.delete('/levels/:id', deleteLevel);
router.get('/majors', getMajors);
router.post('/majors', createMajor);
router.get('/majors/:id/deletion-impact', analyzeMajorDeletionImpact);
router.delete('/majors/:id', deleteMajor);
router.post('/majors/subject', addSubjectToMajor);
router.delete('/majors/:majorId/subjects/:subjectId', removeSubjectFromMajor);
router.get('/majors/:majorId/subjects', getMajorSubjects);

// Export grades as CSV for a class (optional query param: period)
router.get('/export/grades', exportClassGrades);

export default router;
