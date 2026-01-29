import { Request, Response } from 'express';
import prisma from '../../shared/prisma';
import { sendResponse } from '../../shared/response.utils';
import { Role } from '@prisma/client';

export const getRoles = (req: Request, res: Response) => {
    // Return Enum values as a list
    const roles = Object.values(Role);
    sendResponse(res, 200, true, roles, 'Roles fetched successfully');
};

export const getAllPermissions = async (req: Request, res: Response) => {
    try {
        const permissions = await prisma.permission.findMany({
            orderBy: { category: 'asc' }
        });
        sendResponse(res, 200, true, permissions, 'Permissions fetched successfully');
    } catch (error: any) {
        console.error('[RoleService] getAllPermissions Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const getRolePermissions = async (req: Request, res: Response) => {
    try {
        const rolePermissions = await prisma.rolePermission.findMany({
            include: { permission: true }
        });

        // Transform into a cleaner structure if needed, or just return as is
        // Structure: { "Administrator": ["user.create", ...], "Teacher": [...] }
        const matrix: Record<string, string[]> = {};

        // Initialize all roles with empty arrays
        Object.values(Role).forEach(r => matrix[r] = []);

        rolePermissions.forEach(rp => {
            if (!matrix[rp.role]) matrix[rp.role] = [];
            matrix[rp.role].push(rp.permission.code);
        });

        sendResponse(res, 200, true, matrix, 'Role Permissions fetched successfully');
    } catch (error: any) {
        console.error('[RoleService] getRolePermissions Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};

export const updateRolePermission = async (req: Request, res: Response) => {
    try {
        const { role, permissionCode, enabled } = req.body;

        if (!role || !permissionCode) {
            return sendResponse(res, 400, false, null, 'Role and Permission Code are required');
        }

        const permission = await prisma.permission.findUnique({ where: { code: permissionCode } });
        if (!permission) {
            return sendResponse(res, 404, false, null, 'Permission not found');
        }

        if (enabled) {
            // Add permission
            await prisma.rolePermission.upsert({
                where: {
                    role_permissionId: {
                        role: role as Role,
                        permissionId: permission.id
                    }
                },
                update: {},
                create: {
                    role: role as Role,
                    permissionId: permission.id
                }
            });
        } else {
            // Remove permission
            await prisma.rolePermission.deleteMany({
                where: {
                    role: role as Role,
                    permissionId: permission.id
                }
            });
        }

        sendResponse(res, 200, true, null, 'Role Permission updated successfully');
    } catch (error: any) {
        console.error('[RoleService] updateRolePermission Error:', error);
        sendResponse(res, 500, false, null, error.message);
    }
};
