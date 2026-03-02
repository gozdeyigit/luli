import { Router } from 'express';
import {
  createPracticeSession,
  getPracticeSessions,
  getPracticeSession,
  deletePracticeSession
} from '../controllers/practiceSessionController.js';
import { validate, practiceSessionSchema } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', validate(practiceSessionSchema), createPracticeSession);
router.get('/', getPracticeSessions);
router.get('/:id', getPracticeSession);
router.delete('/:id', deletePracticeSession);

export default router;