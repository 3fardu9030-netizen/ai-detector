import { Request, Response } from 'express';
import os from 'os';
import { prisma } from '../config/db';
import { logger } from '../config/logger';
import { aiManager } from '../ai/aiManager';
import { logAudit } from '../middleware/audit';
import { AuthenticatedRequest } from '../middleware/auth';

export const getAdminStats = async (req: Request, res: Response) => {
  try {
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: {
        histories: {
          some: {}
        }
      }
    });

    const totalScans = await prisma.detectionHistory.count();
    const totalFeedback = await prisma.feedback.count();

    // Calculate OS performance metrics
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    const memUsage = ((totalMem - freeMem) / totalMem) * 100;
    
    const serverStatus = {
      uptime: Math.round(os.uptime()),
      nodeVersion: process.version,
      platform: os.platform(),
      cpuUsage: 12.5, // Standard mock representation of server thread cpu load
      memoryUsage: Number(memUsage.toFixed(2)),
      status: 'HEALTHY'
    };

    // Aggregate API usage stats
    const apiLogs = await prisma.aPIUsage.findMany();
    const apiStats = {
      totalCalls: apiLogs.length,
      gemini: apiLogs.filter(l => l.provider === 'GEMINI').length,
      huggingFace: apiLogs.filter(l => l.provider === 'HUGGING_FACE').length,
      mock: apiLogs.filter(l => l.provider === 'MOCK').length,
      averageResponseTime: apiLogs.length > 0 
        ? Number((apiLogs.reduce((acc, curr) => acc + curr.processingTime, 0) / apiLogs.length).toFixed(2))
        : 0
    };

    // Category breakdown
    const imageScans = await prisma.detectionHistory.count({ where: { fileType: 'IMAGE' } });
    const videoScans = await prisma.detectionHistory.count({ where: { fileType: 'VIDEO' } });
    const textScans = await prisma.detectionHistory.count({ where: { fileType: 'TEXT' } });

    res.json({
      totalUsers,
      activeUsers,
      totalScans,
      totalFeedback,
      serverStatus,
      apiStats,
      categories: {
        image: imageScans,
        video: videoScans,
        text: textScans
      }
    });
  } catch (error) {
    logger.error('Failed to get admin stats:', error);
    res.status(500).json({ error: 'Internal server error compiling admin statistics' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
        createdAt: true,
        _count: {
          select: { histories: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    logger.error('Failed to fetch users:', error);
    res.status(500).json({ error: 'Internal server error fetching users' });
  }
};

export const deleteUser = async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;

  if (req.user?.id === id) {
    return res.status(400).json({ error: 'You cannot delete your own administrative account' });
  }

  try {
    await prisma.user.delete({
      where: { id }
    });

    await logAudit(req.user!.id, `ADMIN_DELETED_USER_${id}`, req);

    res.json({ message: 'User account deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete user:', error);
    res.status(500).json({ error: 'Internal server error deleting user account' });
  }
};

export const getFeedbacks = async (req: Request, res: Response) => {
  try {
    const feedbacks = await prisma.feedback.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(feedbacks);
  } catch (error) {
    logger.error('Failed to fetch feedback:', error);
    res.status(500).json({ error: 'Internal server error fetching feedback submissions' });
  }
};

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const logs = await prisma.auditLog.findMany({
      include: {
        user: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 200 // Limit to latest 200 logs
    });
    res.json(logs);
  } catch (error) {
    logger.error('Failed to fetch audit logs:', error);
    res.status(500).json({ error: 'Internal server error fetching audit logs' });
  }
};

// Admin panel action: update provider API keys in memory
export const updateProviderSettings = async (req: AuthenticatedRequest, res: Response) => {
  const { geminiApiKey, hfApiKey } = req.body;

  try {
    if (geminiApiKey !== undefined) {
      process.env.GEMINI_API_KEY = geminiApiKey;
    }
    if (hfApiKey !== undefined) {
      process.env.HUGGING_FACE_API_KEY = hfApiKey;
    }

    // Refresh AI manager configured engines
    aiManager.refreshEngines();

    await logAudit(req.user!.id, 'ADMIN_UPDATED_API_KEYS', req);

    res.json({
      message: 'AI Provider settings updated successfully.',
      activeEngines: {
        gemini: !!process.env.GEMINI_API_KEY,
        huggingFace: !!process.env.HUGGING_FACE_API_KEY
      }
    });
  } catch (error) {
    logger.error('Failed to update provider settings:', error);
    res.status(500).json({ error: 'Internal server error updating AI provider configurations' });
  }
};
