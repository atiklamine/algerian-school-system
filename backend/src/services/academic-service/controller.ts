import { Request, Response } from 'express';
import prisma from '../../shared/prisma';
import { sendResponse } from '../../shared/response.utils';
import { Role } from '@prisma/client';

// Academic Years
export const createAcademicYear = async (req: Request, res: Response) => {
    try {
        const { name, startDate, endDate, isCurrent } = req.body;
        const year = await prisma.academicYear.create({
            data: {
                name,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                isCurrent
            },
        });
        sendResponse(res, 201, true, year, 'Academic Year created');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getAcademicYears = async (req: Request, res: Response) => {
    try {
        const years = await prisma.academicYear.findMany({ orderBy: { startDate: 'desc' } });
        sendResponse(res, 200, true, years, 'Academic Years fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateAcademicYear = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, startDate, endDate, isCurrent } = req.body;

        if (isCurrent) {
            // Update all other years to NOT be current
            await prisma.academicYear.updateMany({
                where: { id: { not: id } },
                data: { isCurrent: false }
            });
        }

        const year = await prisma.academicYear.update({
            where: { id },
            data: {
                name,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                isCurrent
            }
        });

        sendResponse(res, 200, true, year, 'Academic Year updated');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteAcademicYear = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Check if classes exist for this year
        const classCount = await prisma.class.count({ where: { academicYearId: id } });
        if (classCount > 0) {
            return sendResponse(res, 400, false, null, 'Cannot delete year with associated classes');
        }

        await prisma.academicYear.delete({ where: { id } });
        sendResponse(res, 200, true, null, 'Academic Year deleted');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const bulkCreateAcademicYears = async (req: Request, res: Response) => {
    try {
        const { academicYears } = req.body;
        if (!Array.isArray(academicYears)) return sendResponse(res, 400, false, null, 'Invalid data format');

        const created = [];
        for (const y of academicYears) {
            try {
                const year = await prisma.academicYear.create({
                    data: {
                        name: y.name,
                        startDate: new Date(y.startDate || new Date()),
                        endDate: new Date(y.endDate || new Date()),
                        isCurrent: y.isCurrent === true || y.isCurrent === 'true'
                    }
                });
                created.push(year);
            } catch (err) { console.error(`Error creating year ${y.name}:`, err); }
        }
        sendResponse(res, 201, true, created, `${created.length} years created`);
    } catch (error: any) { sendResponse(res, 500, false, null, error.message); }
};

// Subjects
export const createSubject = async (req: Request, res: Response) => {
    try {
        const { code, nameAr, nameFr } = req.body;
        const subject = await prisma.subject.create({
            data: { code, nameAr, nameFr },
        });
        sendResponse(res, 201, true, subject, 'Subject created');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateSubject = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, nameAr, nameFr } = req.body;
        const subject = await prisma.subject.update({
            where: { id },
            data: { code, nameAr, nameFr }
        });
        sendResponse(res, 200, true, subject, 'Subject updated');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const bulkCreateSubjects = async (req: Request, res: Response) => {
    try {
        const { subjects } = req.body;
        if (!Array.isArray(subjects)) return sendResponse(res, 400, false, null, 'Invalid data format');

        const created = [];
        for (const s of subjects) {
            try {
                const subject = await prisma.subject.create({
                    data: { code: s.code, nameAr: s.nameAr, nameFr: s.nameFr }
                });
                created.push(subject);
            } catch (err) { console.error(`Error creating subject ${s.code}:`, err); }
        }
        sendResponse(res, 201, true, created, `${created.length} subjects created`);
    } catch (error: any) { sendResponse(res, 500, false, null, error.message); }
};

export const getSubjects = async (req: Request, res: Response) => {
    try {
        const subjects = await prisma.subject.findMany();
        sendResponse(res, 200, true, subjects, 'Subjects fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Classes
export const createClass = async (req: Request, res: Response) => {
    try {
        const { name, majorId, academicYearId, mainTeacherId } = req.body;

        // 1. Create the class
        const newClass = await prisma.class.create({
            data: { name, majorId, academicYearId, mainTeacherId },
        });

        // 2. Fetch subjects from the Major to populate the class automatically
        const majorSubjects = await prisma.majorSubject.findMany({
            where: { majorId }
        });

        if (majorSubjects.length > 0) {
            await prisma.classSubject.createMany({
                data: majorSubjects.map(ms => ({
                    classId: newClass.id,
                    subjectId: ms.subjectId,
                    coefficient: ms.coefficient,
                    // teacherId left null initially
                }))
            });
        }

        sendResponse(res, 201, true, newClass, 'Class created with inherited subjects');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateClass = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { name, majorId, academicYearId, mainTeacherId } = req.body;

        const existingClass = await prisma.class.findUnique({ where: { id } });

        const updatedClass = await prisma.class.update({
            where: { id },
            data: { name, majorId, academicYearId, mainTeacherId }
        });

        // If major shifted, we might need to reset subjects? 
        // For now, let's keep it simple as the user focused on creation and sync.

        sendResponse(res, 200, true, updatedClass, 'Class updated');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteClass = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        // First delete relations
        await prisma.classSubject.deleteMany({ where: { classId: id } });
        // Then delete class
        await prisma.class.delete({ where: { id } });
        sendResponse(res, 200, true, null, 'Class deleted');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const bulkCreateClasses = async (req: Request, res: Response) => {
    try {
        const { classes } = req.body;
        if (!Array.isArray(classes)) return sendResponse(res, 400, false, null, 'Invalid data format');

        const created = [];
        for (const c of classes) {
            try {
                const cls = await prisma.class.create({
                    data: {
                        name: c.name,
                        majorId: c.majorId,
                        academicYearId: c.academicYearId
                    }
                });
                created.push(cls);
            } catch (err) { console.error(`Error creating class ${c.name}:`, err); }
        }
        sendResponse(res, 201, true, created, `${created.length} classes created`);
    } catch (error: any) { sendResponse(res, 500, false, null, error.message); }
};

export const getClasses = async (req: Request, res: Response) => {
    try {
        const classes = await prisma.class.findMany({
            include: {
                academicYear: true,
                major: { include: { level: true } },
                subjects: { include: { subject: true, teacher: true } },
                students: true
            },
        });
        sendResponse(res, 200, true, classes, 'Classes fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getClass = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const cls = await prisma.class.findUnique({
            where: { id },
            include: {
                academicYear: true,
                major: { include: { level: true, subjects: { include: { subject: true } } } },
                subjects: { include: { subject: true, teacher: true } },
                students: true
            }
        });

        if (!cls) {
            return sendResponse(res, 404, false, null, 'Class not found');
        }

        sendResponse(res, 200, true, cls, 'Class fetched successfully');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getClassesForTeacher = async (req: Request, res: Response) => {
    try {
        const { teacherId } = req.params;
        const classes = await prisma.class.findMany({
            where: {
                subjects: { some: { teacherId } }
            },
            include: {
                academicYear: true,
                students: true,
                subjects: {
                    where: { teacherId },
                    include: { subject: true }
                }
            }
        });
        sendResponse(res, 200, true, classes, 'Teacher classes fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Link Subject to Class with Coefficient
// Link Subject to Class with Coefficient
export const addSubjectToClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params.classId || req.body.classId;
        const { subjectId, teacherId } = req.body;
        let { coefficient } = req.body;

        // Fetch class to find majorId and its default subject coefficient
        const cls = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                major: {
                    include: {
                        subjects: {
                            where: { subjectId }
                        }
                    }
                }
            }
        });

        if (!cls) {
            return sendResponse(res, 404, false, null, 'Class not found');
        }

        // If coefficient is not specified in request, use the one from Major (Specialty)
        if (!coefficient) {
            const majorSub = cls.major.subjects[0];
            coefficient = majorSub ? majorSub.coefficient : 2;
        }

        const link = await prisma.classSubject.create({
            data: {
                classId,
                subjectId,
                coefficient: Number(coefficient),
                teacherId
            }
        });
        sendResponse(res, 201, true, link, 'Subject added to Class with inherited coefficient');
    } catch (error: any) {
        console.error('[AcademicService] addSubjectToClass Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const removeSubjectFromClass = async (req: Request, res: Response) => {
    try {
        const { classId, subjectId } = req.params;
        await prisma.classSubject.deleteMany({
            where: {
                classId: classId,
                subjectId: subjectId
            }
        });
        sendResponse(res, 200, true, null, 'Subject removed from Class');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateClassSubject = async (req: Request, res: Response) => {
    try {
        const { classId, subjectId } = req.params;
        const { coefficient, teacherId } = req.body;

        // Using updateMany because compound unique key might be tricky with standard update if not defined exactly so in Prisma client schema for single access
        // Ideally the schema has @@unique([classId, subjectId]) which allows update unique. 
        // But to be safe and consistent with previous patterns if unsure, updateMany works for composite keys too.
        // Actually, let's try standard update if the schema supports it, but updateMany is safer if we don't know the exact unique constraint name generated by Prisma.
        // Given 'addSubjectToClass' creates a classSubject, let's assume valid composite key.

        const updated = await prisma.classSubject.updateMany({
            where: {
                classId: classId,
                subjectId: subjectId
            },
            data: {
                coefficient: Number(coefficient),
                teacherId: teacherId || null
            }
        });

        if (updated.count === 0) {
            return sendResponse(res, 404, false, null, 'Subject not linked to class');
        }

        sendResponse(res, 200, true, null, 'Class subject updated');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const addStudentToClass = async (req: Request, res: Response) => {
    try {
        const classId = req.params.classId || req.body.classId;
        const studentId = req.params.studentId || req.body.studentId;

        // Check if class exists
        const cls = await prisma.class.findUnique({ where: { id: classId } });
        if (!cls) return sendResponse(res, 404, false, null, 'Class not found');

        // Update user
        const user = await prisma.user.update({
            where: { id: studentId },
            data: { classId }
        });

        sendResponse(res, 200, true, user, 'Student added to class');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
}

// Get students for a specific class
export const getClassStudents = async (req: Request, res: Response) => {
    try {
        const { classId } = req.params;
        const students = await prisma.user.findMany({
            where: {
                role: Role.Student,
                classId: classId
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                classId: true
            },
            orderBy: {
                username: 'asc'
            }
        });
        sendResponse(res, 200, true, students, 'Class students fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const removeStudentFromClass = async (req: Request, res: Response) => {
    try {
        const studentId = req.params.studentId;
        // Optionally check classId if provided for validation
        await prisma.user.update({
            where: { id: studentId },
            data: { classId: null }
        });
        sendResponse(res, 200, true, null, 'Student removed from class');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Grades
export const createGrade = async (req: Request, res: Response) => {
    try {
        const { studentId, teacherId, subjectId, examType, period, grade, coefficient, comment } = req.body;

        // Validation: 0-20 scale
        if (grade < 0 || grade > 20) {
            return sendResponse(res, 400, false, null, 'Grade must be between 0 and 20');
        }

        const newGrade = await prisma.grade.create({
            data: {
                studentId,
                teacherId,
                subjectId,
                examType,
                period,
                grade,
                coefficient,
                comment
            }
        });
        sendResponse(res, 201, true, newGrade, 'Grade submitted successfully');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getGradesByStudent = async (req: Request, res: Response) => {
    try {
        const { studentId } = req.params;
        const grades = await prisma.grade.findMany({
            where: { studentId },
            include: {
                teacher: true,
                subject: true,
                examTypeRef: true,
                periodRef: true
            }
        });
        sendResponse(res, 200, true, grades, 'Grades fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getMyGrades = async (req: Request, res: Response) => {
    try {
        const studentId = req.user?.id;
        if (!studentId) return sendResponse(res, 401, false, null, 'User not identified');

        const grades = await prisma.grade.findMany({
            where: { studentId },
            include: {
                teacher: true,
                subject: true,
                examTypeRef: true,
                periodRef: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        sendResponse(res, 200, true, grades, 'My grades fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getStudentBulletin = async (req: Request, res: Response) => {
    try {
        const { studentId, period } = req.params;

        // 1. Fetch Student & Class Info
        const student = await prisma.user.findUnique({
            where: { id: studentId },
            include: {
                class: {
                    include: {
                        subjects: { include: { subject: true } },
                        academicYear: true
                    }
                }
            }
        });

        if (!student || !student.class) {
            return sendResponse(res, 404, false, null, 'Student or Class not found');
        }

        // 2. Fetch Grades for Period
        const grades = await prisma.grade.findMany({
            where: {
                studentId,
                period
            },
            include: { subject: true }
        });

        // 3. Process Evaluation
        const bulletinData: any[] = [];
        let totalWeightedAverage = 0;
        let totalCoefficients = 0;

        for (const classSubject of student.class.subjects) {
            const subjectId = classSubject.subjectId;
            const coefficient = classSubject.coefficient;

            // Filter grades for this subject
            const subjectGrades = grades.filter(g => g.subjectId === subjectId);

            let subjectAverage = 0;
            if (subjectGrades.length > 0) {
                const totalPoints = subjectGrades.reduce((acc, curr) => acc + (curr.grade * (curr.coefficient || 1)), 0);
                const totalGradeCoeffs = subjectGrades.reduce((acc, curr) => acc + (curr.coefficient || 1), 0);
                subjectAverage = totalGradeCoeffs > 0 ? totalPoints / totalGradeCoeffs : 0;
            }

            bulletinData.push({
                subject: classSubject.subject,
                coefficient,
                grades: subjectGrades,
                average: parseFloat(subjectAverage.toFixed(2)),
                points: parseFloat((subjectAverage * coefficient).toFixed(2))
            });

            if (subjectGrades.length > 0) {
                totalWeightedAverage += (subjectAverage * coefficient);
                totalCoefficients += coefficient;
            }
        }

        const generalAverage = totalCoefficients > 0 ? totalWeightedAverage / totalCoefficients : 0;

        // Decision Logic
        let decision = '';
        if (generalAverage >= 10) decision = 'Admis(e)';
        else if (generalAverage >= 9) decision = 'Rachat Possible';
        else decision = 'Ajourné(e)';

        const responsePayload = {
            student: {
                id: student.id,
                username: student.username,
                class: student.class.name,
                academicYear: student.class.academicYear?.name
            },
            period,
            subjects: bulletinData,
            generalAverage: parseFloat(generalAverage.toFixed(2)),
            decision
        };

        sendResponse(res, 200, true, responsePayload, 'Bulletin generated');

    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const bulkDeleteAcademicYears = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return sendResponse(res, 400, false, null, 'Invalid data format');

        // Check if any year has associated classes before deleting
        const yearsWithClasses = await prisma.class.findMany({
            where: { academicYearId: { in: ids } },
            select: { academicYearId: true }
        });

        const safeIds = ids.filter(id => !yearsWithClasses.some(wc => wc.academicYearId === id));

        const result = await prisma.academicYear.deleteMany({
            where: { id: { in: safeIds } }
        });

        sendResponse(res, 200, true, result, `${result.count} years deleted. ${ids.length - result.count} skipped due to associated classes.`);
    } catch (error: any) { sendResponse(res, 500, false, null, error.message); }
};

export const bulkDeleteSubjects = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return sendResponse(res, 400, false, null, 'Invalid data format');

        const result = await prisma.subject.deleteMany({
            where: { id: { in: ids } }
        });

        sendResponse(res, 200, true, result, `${result.count} subjects deleted`);
    } catch (error: any) { sendResponse(res, 500, false, null, error.message); }
};

export const bulkDeleteClasses = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) return sendResponse(res, 400, false, null, 'Invalid data format');

        // deleteMany handles related ClassSubject records if delete cascade is on, but Prisma might need manual handling if not
        // Here we assume standard cascade or simple deleteMany for the main entities
        const result = await prisma.class.deleteMany({
            where: { id: { in: ids } }
        });

        sendResponse(res, 200, true, result, `${result.count} classes deleted`);
    } catch (error: any) { sendResponse(res, 500, false, null, error.message); }
};

export const getDashboardStats = async (req: Request, res: Response) => {
    try {
        const [classes, subjects, students] = await Promise.all([
            prisma.class.count(),
            prisma.subject.count(),
            prisma.user.count({ where: { role: Role.Student } })
        ]);
        sendResponse(res, 200, true, { classes, subjects, students }, 'Dashboard statistics fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Export class grades as CSV
export const exportClassGrades = async (req: Request, res: Response) => {
    try {
        const classId = String(req.query.classId || req.query.id || '');
        const period = req.query.period ? String(req.query.period) : undefined;

        if (!classId) return sendResponse(res, 400, false, null, 'Missing classId');

        const cls = await prisma.class.findUnique({
            where: { id: classId },
            include: {
                students: { where: { role: 'Student' } },
                subjects: { include: { subject: true } }
            }
        });

        if (!cls) return sendResponse(res, 404, false, null, 'Class not found');

        const studentIds = cls.students.map(s => s.id);

        const grades = await prisma.grade.findMany({
            where: {
                studentId: { in: studentIds },
                ...(period ? { period } : {})
            },
            include: { subject: true }
        });

        const subjects = cls.subjects.map(cs => ({
            id: cs.subjectId,
            name: cs.subject?.nameFr || cs.subject?.nameAr || cs.subject?.code || cs.subjectId,
            coeff: cs.coefficient
        }));

        // CSV header
        const headers = ['StudentId', 'StudentUsername', 'StudentEmail', ...subjects.map(s => s.name), 'GeneralAverage'];

        const rows: string[][] = [];

        for (const student of cls.students) {
            const row: string[] = [student.id, student.username || '', student.email || ''];

            let totalWeighted = 0;
            let totalCoeffs = 0;

            for (const subj of subjects) {
                const sGrades = grades.filter(g => g.studentId === student.id && g.subjectId === subj.id);
                let subjAvg = 0;
                if (sGrades.length > 0) {
                    const totalPoints = sGrades.reduce((acc, cur) => acc + (cur.grade * (cur.coefficient || 1)), 0);
                    const totalGCoeffs = sGrades.reduce((acc, cur) => acc + (cur.coefficient || 1), 0);
                    subjAvg = totalGCoeffs > 0 ? totalPoints / totalGCoeffs : 0;
                }
                row.push(subjAvg.toFixed(2));
                if (sGrades.length > 0) {
                    totalWeighted += subjAvg * (subj.coeff || 1);
                    totalCoeffs += subj.coeff || 0;
                }
            }

            const generalAverage = totalCoeffs > 0 ? (totalWeighted / totalCoeffs) : 0;
            row.push(generalAverage.toFixed(2));

            rows.push(row);
        }

        // Build CSV string (escape values)
        const escape = (v: string) => `"${String(v).replace(/"/g, '""')}"`;
        const csv = [headers.map(escape).join(','), ...rows.map(r => r.map(escape).join(','))].join('\n');

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="class_${cls.name}_grades.csv"`);
        res.send(csv);

    } catch (error: any) {
        console.error('[ExportCSV] Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

