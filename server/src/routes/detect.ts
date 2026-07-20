import { Router } from 'express';
import { scanImage, scanVideo, scanText } from '../controllers/detectController';
import { authenticate } from '../middleware/auth';
import { upload } from '../middleware/upload';
import { scanLimiter } from '../middleware/rateLimiter';

const router = Router();

// Apply scan limiters to protect CPU/memory resources
router.post('/image', authenticate, scanLimiter, upload.single('file'), scanImage);
router.post('/video', authenticate, scanLimiter, upload.single('file'), scanVideo);
router.post('/text', authenticate, scanLimiter, scanText);

export default router;
