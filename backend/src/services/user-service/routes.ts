import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { getTeachers, getStudents, getAdmins, createStudent, createUser, updateUser, bulkCreateStudents, deleteUser, bulkDeleteUsers, getProfile } from './controller';

const router = Router();
router.use(authenticate);

router.get('/profile', getProfile);
router.get('/teachers', getTeachers);
router.get('/students', getStudents);
router.get('/admins', getAdmins);
router.post('/student', createStudent);
router.post('/', createUser);
router.put('/:id', updateUser);
router.post('/bulk-students', bulkCreateStudents);
router.delete('/bulk-delete', bulkDeleteUsers);
router.delete('/:id', deleteUser);

export default router;
