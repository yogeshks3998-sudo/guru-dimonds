import { validateProductionEnv } from '../../backend/src/config/env';

describe('Production Environment & JWT Startup Validation', () => {
  const baseValidConfig = {
    port: 5000,
    databaseUrl: 'postgresql://postgres:pass@localhost:5432/gurudiamonds?sslmode=require',
    jwtSecret: 'a-very-strong-and-cryptographically-secure-production-secret-key-32chars',
    nodeEnv: 'production',
    appUrl: 'https://gurudiamonds.in',
    razorpayKeyId: 'rzp_live_test123',
    razorpayKeySecret: 'liveSecret123',
    razorpayWebhookSecret: 'webhookSecret123',
    emailProvider: 'brevo',
    fromEmail: 'info@gurudiamonds.in',
    fromName: 'Guru Diamonds',
    brevoApiKey: 'test-key',
    resendApiKey: '',
    smtpHost: '',
    smtpPort: 587,
    smtpUser: '',
    smtpPass: '',
    smtpSecure: false,
  };

  test('passes validation when production configuration is strong and valid', () => {
    expect(() => validateProductionEnv(baseValidConfig as any)).not.toThrow();
  });

  test('throws fail-fast error when JWT_SECRET uses default placeholder in production', () => {
    const invalidConfig = {
      ...baseValidConfig,
      jwtSecret: 'change-this-before-production',
    };

    expect(() => validateProductionEnv(invalidConfig as any)).toThrow(
      /JWT_SECRET must not use a known default or placeholder value in production/i
    );
  });

  test('throws fail-fast error when JWT_SECRET is too short (< 32 characters) in production', () => {
    const shortConfig = {
      ...baseValidConfig,
      jwtSecret: 'too-short-secret',
    };

    expect(() => validateProductionEnv(shortConfig as any)).toThrow(
      /JWT_SECRET must be at least 32 characters long/i
    );
  });

  test('throws fail-fast error when JWT_SECRET is empty in production', () => {
    const emptyConfig = {
      ...baseValidConfig,
      jwtSecret: '',
    };

    expect(() => validateProductionEnv(emptyConfig as any)).toThrow(
      /JWT_SECRET is required in production/i
    );
  });

  test('throws fail-fast error when DATABASE_URL is missing in production', () => {
    const noDbConfig = {
      ...baseValidConfig,
      databaseUrl: '',
    };

    expect(() => validateProductionEnv(noDbConfig as any)).toThrow(
      /DATABASE_URL is required in production/i
    );
  });

  test('never outputs the secret value in error messages', () => {
    const secretWithMarker = 'short-secret-MARKER';
    const config = {
      ...baseValidConfig,
      jwtSecret: secretWithMarker,
    };

    try {
      validateProductionEnv(config as any);
      throw new Error('Expected validation to throw');
    } catch (err: any) {
      expect(err.message).not.toContain(secretWithMarker);
      expect(err.message).toContain('JWT_SECRET');
    }
  });

  test('allows placeholder/short JWT_SECRET in development mode without throwing', () => {
    const devConfig = {
      ...baseValidConfig,
      nodeEnv: 'development',
      jwtSecret: 'change-this-before-production',
      databaseUrl: '',
    };

    expect(() => validateProductionEnv(devConfig as any)).not.toThrow();
  });
});
