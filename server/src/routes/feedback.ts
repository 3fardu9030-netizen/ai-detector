import { Router } from 'express';
import { submitFeedback } from '../controllers/feedbackController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, submitFeedback);

export default router;
