import { Router } from 'express';
import { register, login, getProfile } from '../controllers/authController.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.get('/profile', authenticateToken, getProfile);

export default router;