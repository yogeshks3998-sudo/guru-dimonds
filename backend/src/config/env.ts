import dotenv from 'dotenv';

dotenv.config();

export const env = {
  port: Number(process.env.PORT || 5000),
  databaseUrl: process.env.DATABASE_URL || '',
  jwtSecret: process.env.JWT_SECRET || 'change-this-before-production',
  nodeEnv: process.env.NODE_ENV || 'development',
  razorpayKeyId: process.env.RAZORPAY_KEY_ID || '',
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET || '',
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  emailProvider: (process.env.EMAIL_PROVIDER || 'brevo').trim().toLowerCase(),
  fromEmail: (process.env.FROM_EMAIL || 'info@gurudaimonds.in').trim(),
  fromName: (process.env.FROM_NAME || 'Guru Diamonds').trim(),


  brevoApiKey: (process.env.BREVO_API_KEY || '').trim(),
  resendApiKey: (process.env.RESEND_API_KEY || '').trim(),
  smtpHost: (process.env.SMTP_HOST || '').trim(),
  smtpPort: Number(process.env.SMTP_PORT || 587),
  smtpUser: (process.env.SMTP_USER || '').trim(),
  smtpPass: (process.env.SMTP_PASS || '').trim(),
  smtpSecure: process.env.SMTP_SECURE === 'true',
};
