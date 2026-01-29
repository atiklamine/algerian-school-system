import { Request, Response } from 'express';
import prisma from '../../shared/prisma';
import { sendResponse } from '../../shared/response.utils';

// ==================== EXAM TYPES ====================

export const getExamTypes = async (req: Request, res: Response) => {
    try {
        const examTypes = await prisma.examType.findMany({
            where: { isActive: true },
            orderBy: { code: 'asc' }
        });
        sendResponse(res, 200, true, examTypes, 'Exam types fetched');
    } catch (error: any) {
        console.error('[AcademicService] getExamTypes Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createExamType = async (req: Request, res: Response) => {
    try {
        const { code, nameAr, nameFr, nameEn, nameZgh } = req.body;

        // Check if code already exists
        const existing = await prisma.examType.findUnique({ where: { code } });
        if (existing) {
            return sendResponse(res, 409, false, null, 'Exam type with this code already exists');
        }

        const examType = await prisma.examType.create({
            data: {
                code,
                nameAr,
                nameFr,
                nameEn: nameEn || '',
                nameZgh: nameZgh || '',
                isActive: true
            }
        });

        sendResponse(res, 201, true, examType, 'Exam type created');
    } catch (error: any) {
        console.error('[AcademicService] createExamType Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateExamType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, nameAr, nameFr, nameEn, nameZgh, isActive } = req.body;

        const examType = await prisma.examType.update({
            where: { id },
            data: {
                code,
                nameAr,
                nameFr,
                nameEn: nameEn !== undefined ? nameEn : undefined,
                nameZgh: nameZgh !== undefined ? nameZgh : undefined,
                isActive
            }
        });

        sendResponse(res, 200, true, examType, 'Exam type updated');
    } catch (error: any) {
        console.error('[AcademicService] updateExamType Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteExamType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete - just mark as inactive
        await prisma.examType.update({
            where: { id },
            data: { isActive: false }
        });

        sendResponse(res, 200, true, null, 'Exam type deactivated');
    } catch (error: any) {
        console.error('[AcademicService] deleteExamType Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

// ==================== PERIODS ====================

export const getPeriods = async (req: Request, res: Response) => {
    try {
        const { academicYearId } = req.query;

        const where: any = { isActive: true };
        if (academicYearId) {
            where.academicYearId = academicYearId as string;
        }

        const periods = await prisma.period.findMany({
            where,
            include: { academicYear: true },
            orderBy: { startDate: 'asc' }
        });

        sendResponse(res, 200, true, periods, 'Periods fetched');
    } catch (error: any) {
        console.error('[AcademicService] getPeriods Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createPeriod = async (req: Request, res: Response) => {
    try {
        const { code, nameAr, nameFr, nameEn, nameZgh, startDate, endDate, academicYearId } = req.body;

        // Check if code already exists
        const existing = await prisma.period.findUnique({ where: { code } });
        if (existing) {
            return sendResponse(res, 409, false, null, 'Period with this code already exists');
        }

        const period = await prisma.period.create({
            data: {
                code,
                nameAr,
                nameFr,
                nameEn: nameEn || '',
                nameZgh: nameZgh || '',
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                academicYearId,
                isActive: true
            },
            include: { academicYear: true }
        });

        sendResponse(res, 201, true, period, 'Period created');
    } catch (error: any) {
        console.error('[AcademicService] createPeriod Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updatePeriod = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { code, nameAr, nameFr, nameEn, nameZgh, startDate, endDate, academicYearId, isActive } = req.body;

        const period = await prisma.period.update({
            where: { id },
            data: {
                code,
                nameAr,
                nameFr,
                nameEn: nameEn !== undefined ? nameEn : undefined,
                nameZgh: nameZgh !== undefined ? nameZgh : undefined,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
                academicYearId,
                isActive
            },
            include: { academicYear: true }
        });

        sendResponse(res, 200, true, period, 'Period updated');
    } catch (error: any) {
        console.error('[AcademicService] updatePeriod Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deletePeriod = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        // Soft delete - just mark as inactive
        await prisma.period.update({
            where: { id },
            data: { isActive: false }
        });

        sendResponse(res, 200, true, null, 'Period deactivated');
    } catch (error: any) {
        console.error('[AcademicService] deletePeriod Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};
