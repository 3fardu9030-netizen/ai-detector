import nodemailer from 'nodemailer';
import { logger } from './logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_PORT === '465',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
});

export const sendMail = async (to: string, subject: string, html: string, text: string) => {
  const mailOptions = {
    from: process.env.SMTP_FROM || '"TruthLens AI" <noreply@truthlens.ai>',
    to,
    subject,
    html,
    text,
  };

  // If credentials are empty, log to console instead of trying to send SMTP
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    logger.info(`
=========================================
EMAIL SIMULATION (SMTP not configured)
To: ${to}
Subject: ${subject}
Message: ${text}
=========================================
    `);
    return { messageId: 'simulated-id' };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${to}: ${info.messageId}`);
    return info;
  } catch (error) {
    logger.error(`Failed to send email to ${to}:`, error);
    // Silent recovery: fall back to logging in case of bad configuration
    logger.info(`Simulated email payload:\nSubject: ${subject}\nBody: ${text}`);
    return { messageId: 'error-recovery-id' };
  }
};
