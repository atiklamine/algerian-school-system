import { Router } from 'express';
import { login, register } from './controller';

import { validate } from '../../middleware/validate';
import { loginSchema, registerSchema } from '../../schemas/auth.schema';

const router = Router();

router.post('/login', validate(loginSchema), login);
router.post('/register', validate(registerSchema), register);

export default router;
