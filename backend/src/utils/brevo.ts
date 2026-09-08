import { env } from '../config/env';
import { HttpError } from './http';

type SendOtpSmsParams = {
  phone: string;
  otp: string;
};

const brevoSmsEndpoint = 'https://api.brevo.com/v3/transactionalSMS/send';
const toBrevoRecipient = (phone: string) => phone.replace(/^\+/, '');

export const sendRegistrationOtpSms = async ({ phone, otp }: SendOtpSmsParams) => {
  const sender = (process.env.BREVO_SMS_SENDER || 'GuruDiamond').trim();
  if (!env.brevoApiKey) {
    console.log(`[SMS FALLBACK] SMS OTP for ${phone}: ${otp}`);
    return;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const response = await fetch(brevoSmsEndpoint, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        accept: 'application/json',
        'api-key': env.brevoApiKey,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender,
        recipient: toBrevoRecipient(phone),
        content: `Your Guru Diamonds verification code is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
        type: 'transactional',
      }),
    });

    if (!response.ok) {
      console.warn(`Brevo SMS send failed (${response.status}). Email OTP was dispatched.`);
    }
  } catch (error) {
    console.warn(`Brevo SMS failed:`, error);
  } finally {
    clearTimeout(timeout);
  }
};
