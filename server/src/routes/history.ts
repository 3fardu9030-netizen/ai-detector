import { Router } from 'express';
import { getHistory, deleteHistoryItem, getDashboardStats } from '../controllers/historyController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.get('/', authenticate, getHistory);
router.get('/dashboard', authenticate, getDashboardStats);
router.delete('/:id', authenticate, deleteHistoryItem);

export default router;
