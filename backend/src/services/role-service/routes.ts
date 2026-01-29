import { Router } from 'express';
import { getRoles, getAllPermissions, getRolePermissions, updateRolePermission } from './controller';
import { authenticate, requireRole } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

// Only Admins can view/edit role permissions
router.get('/list', authenticate, requireRole([Role.Administrator, Role.Director]), getRoles);
router.get('/permissions', authenticate, requireRole([Role.Administrator, Role.Director]), getAllPermissions);
router.get('/matrix', authenticate, requireRole([Role.Administrator, Role.Director]), getRolePermissions);
router.post('/matrix', authenticate, requireRole([Role.Administrator]), updateRolePermission); // Only super admin can edit

export default router;
