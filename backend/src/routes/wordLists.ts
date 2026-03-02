import { Router } from 'express';
import {
  createWordList,
  getWordLists,
  getWordList,
  updateWordList,
  deleteWordList
} from '../controllers/wordListController.js';
import { validate, wordListSchema } from '../middleware/validation.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/', validate(wordListSchema), createWordList);
router.get('/', getWordLists);
router.get('/:id', getWordList);
router.put('/:id', validate(wordListSchema), updateWordList);
router.delete('/:id', deleteWordList);

export default router;