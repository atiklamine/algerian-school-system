import { Request, Response } from 'express';
import prisma from '../../shared/prisma';
import { sendResponse } from '../../shared/response.utils';
import { Role } from '@prisma/client';
import { hashPassword } from '../../shared/auth.utils';

export const getTeachers = async (req: Request, res: Response) => {
    try {
        const teachers = await prisma.user.findMany({
            where: { role: Role.Teacher },
            select: { id: true, username: true, email: true, role: true }
        });
        sendResponse(res, 200, true, teachers, 'Teachers fetched successfully');
    } catch (error: any) {
        console.error('[UserService] getTeachers Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.user?.userId;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: {
                class: true, // If student
                classesAsMainTeacher: true,
            }
        });

        if (!user) {
            return sendResponse(res, 404, false, null, 'User not found');
        }

        const { passwordHash, ...userWithoutPassword } = user;
        sendResponse(res, 200, true, userWithoutPassword, 'Profile fetched successfully');
    } catch (error: any) {
        console.error('[UserService] getProfile Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getAdmins = async (req: Request, res: Response) => {
    try {
        const admins = await prisma.user.findMany({
            where: {
                role: { in: [Role.Administrator, Role.Director, Role.Manager] }
            },
            select: { id: true, username: true, email: true, role: true }
        });
        sendResponse(res, 200, true, admins, 'Admins/Managers fetched successfully');
    } catch (error: any) {
        console.error('[UserService] getAdmins Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getStudents = async (req: Request, res: Response) => {
    try {
        const students = await prisma.user.findMany({
            where: { role: Role.Student },
            select: {
                id: true, username: true, email: true, role: true,
                classId: true,
                class: {
                    select: {
                        name: true,
                        major: {
                            select: {
                                name: true,
                                level: { select: { name: true } }
                            }
                        }
                    }
                }
            }
        });
        sendResponse(res, 200, true, students, 'Students fetched successfully');
    } catch (error: any) {
        console.error('[UserService] getStudents Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createStudent = async (req: Request, res: Response) => {
    try {
        const { username, email, password } = req.body;
        const passwordHash = await hashPassword(password || 'password123');

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role: Role.Student
            }
        });

        sendResponse(res, 201, true, user, 'Student created successfully');
    } catch (error: any) {
        console.error('[UserService] createStudent Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const createUser = async (req: Request, res: Response) => {
    try {
        const { username, email, password, role } = req.body;
        const passwordHash = await hashPassword(password || 'password123');

        const user = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash,
                role: (role as Role) || Role.Student
            }
        });

        sendResponse(res, 201, true, user, 'User created successfully');
    } catch (error: any) {
        console.error('[UserService] createUser Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

        const updateData: any = { username, email };
        if (role) updateData.role = role as Role;
        if (password) {
            updateData.passwordHash = await hashPassword(password);
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData
        });

        sendResponse(res, 200, true, user, 'User updated successfully');
    } catch (error: any) {
        console.error('[UserService] updateUser Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.user.delete({ where: { id } });
        sendResponse(res, 200, true, null, 'User deleted successfully');
    } catch (error: any) {
        console.error('[UserService] deleteUser Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const bulkCreateStudents = async (req: Request, res: Response) => {
    try {
        const { students } = req.body;

        if (!Array.isArray(students)) {
            return sendResponse(res, 400, false, null, 'Students must be an array');
        }

        const createdStudents = [];
        for (const s of students) {
            try {
                const passwordHash = await hashPassword(s.password || 'password123');
                const user = await prisma.user.create({
                    data: {
                        username: s.username,
                        email: s.email,
                        passwordHash,
                        role: Role.Student
                    }
                });
                createdStudents.push(user);
            } catch (err) {
                console.error(`Error creating student ${s.email}:`, err);
            }
        }

        sendResponse(res, 201, true, createdStudents, `${createdStudents.length} students created successfully`);
    } catch (error: any) {
        console.error('[UserService] bulkCreateStudents Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const bulkDeleteUsers = async (req: Request, res: Response) => {
    try {
        const { ids } = req.body;
        if (!Array.isArray(ids)) {
            return sendResponse(res, 400, false, null, 'IDs must be an array');
        }

        const result = await prisma.user.deleteMany({
            where: { id: { in: ids } }
        });

        sendResponse(res, 200, true, result, `${result.count} users deleted successfully`);
    } catch (error: any) {
        console.error('[UserService] bulkDeleteUsers Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};
