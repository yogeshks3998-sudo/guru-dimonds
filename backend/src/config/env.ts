import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-this-before-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  appUrl: (process.env.APP_URL || 'https://gurudiamonds.in').trim(),
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  emailProvider: (process.env.EMAIL_PROVIDER || 'brevo').trim().toLowerCase(),
  fromEmail: (process.env.FROM_EMAIL || 'info@gurudiamonds.in').trim(),
  fromName: (process.env.FROM_NAME || 'Guru Diamonds').trim(),


  brevoApiKey: (process.env.BREVO_API_KEY || '').trim(),
  resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
  smtpHost: (process.env.SMTP_HOST || '').trim(),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: (process.env.SMTP_USER || '').trim(),
  smtpPass: (process.env.SMTP_PASS || '').trim(),
  smtpSecure: process.env.SMTP_SECURE === 'true',
};

const WEAK_OR_PLACEHOLDER_SECRETS = new Set([
  'change-this-before-production',
  'change-me',
  'secret',
  'jwt_secret',
  'jwtsecret',
  'password',
  'admin',
  'placeholder',
  'default',
  'test',
  '12345678',
  'your-secret-key',
  'supersecret',
]);

export const validateProductionEnv = (config: typeof env = env): void => {
  if (config.nodeEnv === 'production') {
    if (!config.jwtSecret || typeof config.jwtSecret !== 'string') {
      throw new Error('Production configuration error: JWT_SECRET is required in production.');
    }
    const trimmed = config.jwtSecret.trim();
    if (WEAK_OR_PLACEHOLDER_SECRETS.has(trimmed.toLowerCase())) {
      throw new Error('Production configuration error: JWT_SECRET must not use a known default or placeholder value in production.');
    }
    if (trimmed.length < 32) {
      throw new Error('Production configuration error: JWT_SECRET must be at least 32 characters long for cryptographic security in production.');
    }
    if (!config.databaseUrl || !config.databaseUrl.trim()) {
      throw new Error('Production configuration error: DATABASE_URL is required in production.');
    }
  }
};
