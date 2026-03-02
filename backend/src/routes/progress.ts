import { Router } from 'express';
import {
  getProgress,
  getProgressStats,
  resetProgress,
  deleteProgress
} from '../controllers/progressController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.get('/', getProgress);
router.get('/stats/:listId', getProgressStats);
router.post('/reset', resetProgress);
router.delete('/:listId', deleteProgress);

export default router;