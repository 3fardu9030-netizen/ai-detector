import { Request } from 'express';
import { prisma } from '../config/db';
import { logger } from '../config/logger';

export const logAudit = async (
  userId: string | null,
  action: string,
  req: Request
) => {
  const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        ipAddress,
        userAgent,
      },
    });
    
    logger.info(`Audit Log: User ${userId || 'GUEST'} performed [${action}] from IP ${ipAddress}`);
  } catch (error) {
    logger.error('Failed to write audit log:', error);
  }
};
