
import { Request, Response } from 'express';
import prisma from '../../shared/prisma';
import { sendResponse } from '../../shared/response.utils';

// Levels
export const getLevels = async (req: Request, res: Response) => {
    try {
        const levels = await prisma.level.findMany({
            include: {
                majors: {
                    include: {
                        subjects: {
                            include: { subject: true }
                        }
                    }
                }
            }
        });
        sendResponse(res, 200, true, levels, 'Levels fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createLevel = async (req: Request, res: Response) => {
    try {
        const { name } = req.body;
        const level = await prisma.level.create({ data: { name } });
        sendResponse(res, 201, true, level, 'Level created');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Analyze deletion impact for a level
export const analyzeLevelDeletionImpact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get all counts
        const [majors, majorSubjects, classes, classSubjects, students, grades] = await Promise.all([
            prisma.major.count({ where: { levelId: id } }),
            prisma.majorSubject.count({ where: { major: { levelId: id } } }),
            prisma.class.count({ where: { major: { levelId: id } } }),
            prisma.classSubject.count({ where: { class: { major: { levelId: id } } } }),
            prisma.user.count({ where: { class: { major: { levelId: id } } } }),
            prisma.grade.count({
                where: {
                    student: { class: { major: { levelId: id } } }
                }
            })
        ]);

        const impact = {
            majors,
            majorSubjects,
            classes,
            classSubjects,
            students,
            grades,
            canDelete: grades === 0
        };

        sendResponse(res, 200, true, impact, 'Deletion impact analyzed');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteLevel = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // First, check for grades (blocking condition)
        const gradeCount = await prisma.grade.count({
            where: {
                student: { class: { major: { levelId: id } } }
            }
        });

        if (gradeCount > 0) {
            return sendResponse(res, 400, false, null, `Cannot delete level: ${gradeCount} grade(s) exist for students in classes of this level. Delete all grades first.`);
        }

        // Perform cascade deletion in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete all ClassSubject records
            await tx.classSubject.deleteMany({
                where: { class: { major: { levelId: id } } }
            });

            // 2. Unassign all students from affected classes
            await tx.user.updateMany({
                where: { class: { major: { levelId: id } } },
                data: { classId: null }
            });

            // 3. Delete all Class records
            await tx.class.deleteMany({
                where: { major: { levelId: id } }
            });

            // 4. Delete all MajorSubject records
            await tx.majorSubject.deleteMany({
                where: { major: { levelId: id } }
            });

            // 5. Delete all Major records
            await tx.major.deleteMany({
                where: { levelId: id }
            });

            // 6. Delete the Level
            await tx.level.delete({
                where: { id }
            });
        });

        sendResponse(res, 200, true, null, 'Level and all dependencies deleted successfully');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Majors
export const getMajors = async (req: Request, res: Response) => {
    try {
        const { levelId } = req.query;
        const majors = await prisma.major.findMany({
            where: levelId ? { levelId: String(levelId) } : {},
            include: {
                level: true,
                subjects: { include: { subject: true } }
            }
        });
        sendResponse(res, 200, true, majors, 'Majors fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createMajor = async (req: Request, res: Response) => {
    try {
        const { name, levelId } = req.body;
        const major = await prisma.major.create({
            data: { name, levelId }
        });
        sendResponse(res, 201, true, major, 'Major created');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Analyze deletion impact for a major
export const analyzeMajorDeletionImpact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Get all counts
        const [majorSubjects, classes, classSubjects, students, grades] = await Promise.all([
            prisma.majorSubject.count({ where: { majorId: id } }),
            prisma.class.count({ where: { majorId: id } }),
            prisma.classSubject.count({ where: { class: { majorId: id } } }),
            prisma.user.count({ where: { class: { majorId: id } } }),
            prisma.grade.count({
                where: {
                    student: { class: { majorId: id } }
                }
            })
        ]);

        const impact = {
            majorSubjects,
            classes,
            classSubjects,
            students,
            grades,
            canDelete: grades === 0
        };

        sendResponse(res, 200, true, impact, 'Deletion impact analyzed');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteMajor = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // First, check for grades (blocking condition)
        const gradeCount = await prisma.grade.count({
            where: {
                student: { class: { majorId: id } }
            }
        });

        if (gradeCount > 0) {
            return sendResponse(res, 400, false, null, `Cannot delete major: ${gradeCount} grade(s) exist for students in classes of this major. Delete all grades first.`);
        }

        // Perform cascade deletion in transaction
        await prisma.$transaction(async (tx) => {
            // 1. Delete all ClassSubject records
            await tx.classSubject.deleteMany({
                where: { class: { majorId: id } }
            });

            // 2. Unassign all students from affected classes
            await tx.user.updateMany({
                where: { class: { majorId: id } },
                data: { classId: null }
            });

            // 3. Delete all Class records
            await tx.class.deleteMany({
                where: { majorId: id }
            });

            // 4. Delete all MajorSubject records
            await tx.majorSubject.deleteMany({
                where: { majorId: id }
            });

            // 5. Delete the Major
            await tx.major.delete({
                where: { id }
            });
        });

        sendResponse(res, 200, true, null, 'Major and all dependencies deleted successfully');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

// Major Subjects (Coefficients)
export const addSubjectToMajor = async (req: Request, res: Response) => {
    try {
        const { majorId, subjectId, coefficient } = req.body;

        // 1. Update/Create the MajorSubject link
        const link = await prisma.majorSubject.upsert({
            where: { majorId_subjectId: { majorId, subjectId } },
            update: { coefficient },
            create: { majorId, subjectId, coefficient }
        });

        // 2. Propagate to all classes belonging to this Major
        // We update existing links. If a class doesn't have it yet, we could either leave it or add it.
        // The user said "if i want to change coefitions i must change them from the speciality liste".
        // So we update existing class subjects.
        await prisma.classSubject.updateMany({
            where: {
                class: { majorId },
                subjectId: subjectId
            },
            data: { coefficient }
        });

        // Also add it to classes that might be missing it? 
        // Let's ensure consistency across all classes of this major.
        const classes = await prisma.class.findMany({ where: { majorId } });
        for (const cls of classes) {
            await prisma.classSubject.upsert({
                where: { classId_subjectId: { classId: cls.id, subjectId } },
                update: { coefficient },
                create: { classId: cls.id, subjectId, coefficient }
            });
        }

        // ... (previous code)

        sendResponse(res, 201, true, link, 'Subject updated in Major and propagated to all Classes');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const removeSubjectFromMajor = async (req: Request, res: Response) => {
    try {
        const { majorId, subjectId } = req.params;

        // 1. Delete the MajorSubject link
        await prisma.majorSubject.deleteMany({
            where: {
                majorId: majorId,
                subjectId: subjectId
            }
        });

        // 2. Propagate deletion to all classes (Optional but recommended for consistency)
        // If a subject is removed from a Major, it should probably be removed from the classes of that Major too,
        // or at least checking if we should. The user implies strong linkage.
        await prisma.classSubject.deleteMany({
            where: {
                class: { majorId: majorId },
                subjectId: subjectId
            }
        });

        sendResponse(res, 200, true, null, 'Subject removed from Major and all associated Classes');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getMajorSubjects = async (req: Request, res: Response) => {
    try {
        const { majorId } = req.params;
        const subjects = await prisma.majorSubject.findMany({
            where: { majorId },
            include: { subject: true }
        });
        sendResponse(res, 200, true, subjects, 'Major subjects fetched');
    } catch (error: any) {
        sendResponse(res, 500, false, null, error.message);
    }
};
