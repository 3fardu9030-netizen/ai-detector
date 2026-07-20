import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/db';
import { sendMail } from '../config/mailer';
import { logger } from '../config/logger';
import { logAudit } from '../middleware/audit';
import { AuthenticatedRequest } from '../middleware/auth';
import {
  registerSchema,
  loginSchema,
  otpVerifySchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
  updateProfileSchema
} from '../utils/validators';

const JWT_SECRET = process.env.JWT_SECRET || 'truthlens_jwt_secret_token_key_2026';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'truthlens_jwt_refresh_secret_token_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '15m';
const JWT_REFRESH_EXPIRES_IN = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

// Generate Access and Refresh tokens
const generateTokens = (user: { id: string; email: string; role: string }) => {
  const payload = { id: user.id, email: user.email, role: user.role };
  
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN as any });
  const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN as any });
  
  return { accessToken, refreshToken };
};

// Generate 6-digit numeric OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

export const register = async (req: Request, res: Response) => {
  try {
    const validated = registerSchema.parse(req.body);
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email }
    });
    
    if (existingUser) {
      return res.status(400).json({ error: 'Email address already registered' });
    }

    const passwordHash = await bcrypt.hash(validated.password, 10);

    // Make the first user an ADMIN automatically to ease project demonstration
    const userCount = await prisma.user.count();
    const role = userCount === 0 ? 'ADMIN' : 'USER';

    const user = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        passwordHash,
        role,
        isVerified: false
      }
    });

    // Create verification OTP
    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins expiry

    await prisma.otp.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt
      }
    });

    // Send OTP email
    await sendMail(
      user.email,
      'Verify Your TruthLens AI Account',
      `<h3>Welcome to TruthLens AI!</h3>
       <p>Your account verification code is: <strong>${otpCode}</strong></p>
       <p>This code is valid for 15 minutes.</p>`,
      `Welcome to TruthLens AI! Your verification code is: ${otpCode}. Valid for 15 minutes.`
    );

    await logAudit(user.id, 'USER_REGISTERED', req);

    res.status(201).json({
      message: 'Registration successful. Verification OTP sent to your email.',
      userId: user.id,
      email: user.email
    });
  } catch (error: any) {
    logger.error('Registration failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

export const verifyOtp = async (req: Request, res: Response) => {
  try {
    const validated = otpVerifySchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.isVerified) {
      return res.status(400).json({ error: 'Account is already verified' });
    }

    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: validated.code,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: 'desc' }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired OTP code' });
    }

    // Set user verified and delete otp record
    await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true }
    });

    await prisma.otp.deleteMany({
      where: { userId: user.id }
    });

    // Create verification notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: 'Account Verified',
        message: 'Welcome to TruthLens AI! Your email has been successfully verified.'
      }
    });

    await logAudit(user.id, 'USER_EMAIL_VERIFIED', req);

    // Generate tokens
    const { accessToken, refreshToken } = generateTokens(user);

    res.json({
      message: 'Account successfully verified.',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    logger.error('OTP Verification failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error during verification' });
  }
};

export const resendOtp = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email address is required' });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    if (user.isVerified) return res.status(400).json({ error: 'Account is already verified' });

    // Invalidate old OTPs
    await prisma.otp.deleteMany({ where: { userId: user.id } });

    const otpCode = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.otp.create({
      data: {
        userId: user.id,
        code: otpCode,
        expiresAt
      }
    });

    await sendMail(
      user.email,
      'Verify Your TruthLens AI Account (Resent)',
      `<h3>Verify Your Account</h3>
       <p>Your verification code is: <strong>${otpCode}</strong></p>`,
      `Your verification code is: ${otpCode}. Valid for 15 minutes.`
    );

    await logAudit(user.id, 'USER_OTP_RESENT', req);

    res.json({ message: 'A new verification OTP has been sent to your email.' });
  } catch (error) {
    logger.error('Resending OTP failed:', error);
    res.status(500).json({ error: 'Internal server error while resending OTP' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const validated = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    const passwordMatch = await bcrypt.compare(validated.password, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Invalid email or password' });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        error: 'Email address not verified',
        isVerified: false,
        email: user.email
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    await logAudit(user.id, 'USER_LOGIN', req);

    res.json({
      message: 'Login successful',
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error: any) {
    logger.error('Login failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const validated = forgotPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      // Return 200 to prevent user enumeration attacks
      return res.json({ message: 'If the email exists, a password reset code has been sent.' });
    }

    // Clean old OTPs
    await prisma.otp.deleteMany({ where: { userId: user.id } });

    const resetOtp = generateOTP();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.otp.create({
      data: {
        userId: user.id,
        code: resetOtp,
        expiresAt
      }
    });

    await sendMail(
      user.email,
      'Reset Your TruthLens AI Password',
      `<h3>Password Reset Request</h3>
       <p>You requested a password reset. Enter the code below to reset your password:</p>
       <p>Code: <strong>${resetOtp}</strong></p>
       <p>This code expires in 15 minutes.</p>`,
      `Password reset code: ${resetOtp}. Valid for 15 minutes.`
    );

    await logAudit(user.id, 'PASSWORD_RESET_REQUESTED', req);

    res.json({ message: 'If the email exists, a password reset code has been sent.' });
  } catch (error: any) {
    logger.error('Forgot password failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error during password reset request' });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const validated = resetPasswordSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email: validated.email }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const otpRecord = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: validated.code,
        expiresAt: { gte: new Date() }
      }
    });

    if (!otpRecord) {
      return res.status(400).json({ error: 'Invalid or expired reset code' });
    }

    const passwordHash = await bcrypt.hash(validated.newPassword, 10);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { passwordHash, isVerified: true } // Force verified on reset success
      }),
      prisma.otp.deleteMany({
        where: { userId: user.id }
      }),
      prisma.notification.create({
        data: {
          userId: user.id,
          title: 'Password Reset Successful',
          message: 'Your account password has been successfully reset.'
        }
      })
    ]);

    await logAudit(user.id, 'PASSWORD_RESET_COMPLETED', req);

    res.json({ message: 'Password has been reset successfully. You can now login.' });
  } catch (error: any) {
    logger.error('Reset password failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error while resetting password' });
  }
};

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user?.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        notifications: {
          orderBy: { createdAt: 'desc' },
          take: 5
        }
      }
    });
    res.json(user);
  } catch (error) {
    logger.error('Get profile failed:', error);
    res.status(500).json({ error: 'Internal server error fetching profile' });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = updateProfileSchema.parse(req.body);
    const userId = req.user?.id;

    if (validated.email) {
      const emailTaken = await prisma.user.findFirst({
        where: {
          email: validated.email,
          NOT: { id: userId }
        }
      });
      if (emailTaken) {
        return res.status(400).json({ error: 'Email already registered' });
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: validated,
      select: { id: true, name: true, email: true, role: true }
    });

    await logAudit(userId!, 'PROFILE_UPDATED', req);

    res.json({ message: 'Profile updated successfully', user: updated });
  } catch (error: any) {
    logger.error('Update profile failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error updating profile' });
  }
};

export const changePassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const validated = changePasswordSchema.parse(req.body);
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const passwordMatch = await bcrypt.compare(validated.currentPassword, user.passwordHash);
    if (!passwordMatch) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    const passwordHash = await bcrypt.hash(validated.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash }
    });

    await logAudit(userId!, 'PASSWORD_CHANGED', req);

    res.json({ message: 'Password updated successfully' });
  } catch (error: any) {
    logger.error('Change password failed:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({ error: error.errors[0].message });
    }
    res.status(500).json({ error: 'Internal server error changing password' });
  }
};

export const deleteAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    await prisma.user.delete({
      where: { id: userId }
    });

    // Note: audit log is written, but userId will be null in db as user is cascade deleted,
    // which aligns with SetNull relation definition. We pass null for user ID
    await logAudit(null, `ACCOUNT_DELETED_BY_OWNER_${userId}`, req);

    res.json({ message: 'Account successfully deleted. All your data has been removed.' });
  } catch (error) {
    logger.error('Delete account failed:', error);
    res.status(500).json({ error: 'Internal server error deleting account' });
  }
};
