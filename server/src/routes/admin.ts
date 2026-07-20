import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  deleteUser,
  getFeedbacks,
  getAuditLogs,
  updateProviderSettings
} from '../controllers/adminController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

// Apply double protection: user must be logged in AND have ADMIN role
router.get('/stats', authenticate, requireAdmin, getAdminStats);
router.get('/users', authenticate, requireAdmin, getUsers);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
router.get('/feedback', authenticate, requireAdmin, getFeedbacks);
router.get('/audit', authenticate, requireAdmin, getAuditLogs);
router.put('/settings', authenticate, requireAdmin, updateProviderSettings);

export default router;
