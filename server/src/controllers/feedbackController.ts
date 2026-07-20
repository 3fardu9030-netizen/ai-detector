import { Response } from 'express';
import { prisma } from '../config/db';
import { logger } from '../config/logger';
import { AuthenticatedRequest } from '../middleware/auth';
import { feedbackSchema } from '../utils/validators';

export const submitFeedback = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user?.id;

  try {
    const validated = feedbackSchema.parse(req.body);

    const feedback = await prisma.feedback.create({
      data: {
        userId: userId!,
        category: validated.category,
        rating: validated.rating,
        subject: validated.subject,
        message: validated.message
      }
    });

    logger.info(`Feedback submitted by user ${userId}: ${feedback.id}`);

    res.status(201).json({
      message: 'Feedback submitted successfully. Thank you for your input!'
    });
  } catch (error: any) {
    logger.error('Failed to submit feedback:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error submitting feedback' });
  }
};
