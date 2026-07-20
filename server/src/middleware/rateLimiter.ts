import rateLimit from 'express-rate-limit';

// General API limiter: 200 requests per 15 minutes
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 200,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Authentication routes limiter (register/login/otp): 10 requests per 15 minutes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  message: { error: 'Too many authentication attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// AI Scanning limiter (image/video/text): 30 scans per 15 minutes
export const scanLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Scan request limit exceeded, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});
