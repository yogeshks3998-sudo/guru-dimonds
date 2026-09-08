import { env } from '../config/env';
import { prisma } from '../config/db';
import type { Order } from '../../../src/types';

interface EmailPayload {
  to: string;
  toName?: string;
  subject: string;
  html: string;
  text?: string;
  templateName?: string;
  orderId?: string;
}

const sendViaBrevo = async (payload: EmailPayload) => {
  if (!env.brevoApiKey) {
    throw new Error('BREVO_API_KEY is not configured in .env');
  }

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      accept: 'application/json',
      'api-key': env.brevoApiKey,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      sender: {
        name: env.fromName || 'Guru Diamonds',
        email: env.fromEmail || 'info@gurudaimonds.in',
      },


      to: [
        {
          email: payload.to,
          name: payload.toName || payload.to.split('@')[0],
        },
      ],
      subject: payload.subject,
      htmlContent: payload.html,
      textContent: payload.text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Brevo Email API failed (${response.status}): ${errorBody}`);
  }

  return response.json();
};

const sendViaResend = async (payload: EmailPayload) => {
  if (!env.resendApiKey) {
    throw new Error('RESEND_API_KEY is not configured in .env');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${env.fromName || 'Guru Diamonds'} <${env.fromEmail || 'onboarding@resend.dev'}>`,
      to: [payload.to],
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    }),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Resend Email API failed (${response.status}): ${errorBody}`);
  }

  return response.json();
};

export const sendEmail = async (payload: EmailPayload): Promise<{ success: boolean; provider: string; error?: string }> => {
  const provider = env.emailProvider || 'log';

  try {
    if (provider === 'brevo') {
      await sendViaBrevo(payload);
    } else if (provider === 'resend') {
      await sendViaResend(payload);
    } else {
      // Log mode (development fallback / free testing without external keys)
      console.log(`\n================== [EMAIL DISPATCH (${provider.toUpperCase()})] ==================`);
      console.log(`To: ${payload.to} (${payload.toName || ''})`);
      console.log(`Subject: ${payload.subject}`);
      if (payload.text) console.log(`Text:\n${payload.text}`);
      console.log(`=================================================================\n`);
    }

    try {
      await prisma.emailLog.create({
        data: {
          orderId: payload.orderId || null,
          recipient: payload.to,
          subject: payload.subject,
          template: payload.templateName || 'custom_email',
          status: 'SENT',
          provider,
          payload: { subject: payload.subject },
        },
      });
    } catch {
      // Ignore DB log errors
    }

    return { success: true, provider };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error(`Failed to send email to ${payload.to} via ${provider}:`, errorMessage);

    try {
      await prisma.emailLog.create({
        data: {
          orderId: payload.orderId || null,
          recipient: payload.to,
          subject: payload.subject,
          template: payload.templateName || 'custom_email',
          status: 'FAILED',
          provider,
          error: errorMessage,
        },
      });
    } catch {
      // Ignore DB log errors
    }

    // In development or if provider is not configured, don't break flow if log works
    if (provider !== 'log' && !env.brevoApiKey && !env.resendApiKey) {
      console.log(`Falling back to console log for OTP/Email to ${payload.to}`);
      console.log(`Subject: ${payload.subject}`);
      if (payload.text) console.log(`Text: ${payload.text}`);
    }

    return { success: false, provider, error: errorMessage };
  }
};

/**
 * Sends a 6-digit OTP verification email to new registering customers
 */
export const sendOtpEmail = async (params: { email: string; name?: string; otp: string }) => {
  const { email, name, otp } = params;
  const displayName = name || email.split('@')[0];

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Guru Diamonds Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1B1A18;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F3; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="520" border="0" cellspacing="0" cellpadding="0" style="max-width: 520px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E7E1D7; box-shadow: 0 4px 20px rgba(0,0,0,0.05); overflow: hidden;">
          <!-- Header Banner -->
          <tr>
            <td style="background-color: #2D080C; padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 26px; font-family: Georgia, serif; letter-spacing: 2px; text-transform: uppercase;">GURU DIAMONDS</h1>
              <p style="margin: 6px 0 0 0; color: #F7E7CE; font-size: 12px; letter-spacing: 1px;">HAUTE JOAILLERIE & GEMSTONES</p>
            </td>
          </tr>
          
          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px;">
              <h2 style="margin: 0 0 16px 0; color: #1B1A18; font-size: 20px; font-weight: 600;">Welcome, ${displayName}</h2>
              <p style="margin: 0 0 24px 0; color: #555555; font-size: 14px; line-height: 1.6;">
                Thank you for choosing Guru Diamonds. Please use the verification code below to complete your customer account setup:
              </p>
              
              <!-- OTP Box -->
              <div style="background-color: #FAF8F3; border: 1px dashed #A67C32; border-radius: 12px; padding: 24px; text-align: center; margin: 28px 0;">
                <span style="font-size: 34px; font-weight: 700; color: #2D080C; letter-spacing: 8px; font-family: monospace;">${otp}</span>
                <p style="margin: 10px 0 0 0; color: #888888; font-size: 12px;">Valid for 10 minutes. Do not share this code.</p>
              </div>

              <p style="margin: 24px 0 0 0; color: #777777; font-size: 13px; line-height: 1.5;">
                If you did not request this registration, you can safely ignore this message.
              </p>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="background-color: #F6F4EE; padding: 20px 32px; border-top: 1px solid #E7E1D7; text-align: center; color: #8C827A; font-size: 12px;">
              <p style="margin: 0;">&copy; ${new Date().getFullYear()} Guru Diamonds. All rights reserved.</p>
              <p style="margin: 4px 0 0 0;">100% Certified Diamond & Gold Jewellery</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  const text = `Your Guru Diamonds verification code is ${otp}. It is valid for 10 minutes. Do not share this code.`;

  return sendEmail({
    to: email,
    toName: name,
    subject: `Your Guru Diamonds Verification Code: ${otp}`,
    html,
    text,
    templateName: 'customer_registration_otp',
  });
};

/**
 * Sends an itemized Order Confirmation Email with GST breakdown
 */
export const sendOrderConfirmationEmail = async (order: Order) => {
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #EAEAEA;">
        <strong style="color: #1B1A18; font-size: 14px;">${item.productName}</strong>
        ${item.variantSku ? `<br><span style="color: #888; font-size: 12px;">SKU: ${item.variantSku}</span>` : ''}
        ${item.customEngraving ? `<br><span style="color: #A67C32; font-size: 12px;">Engraving: "${item.customEngraving}"</span>` : ''}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid #EAEAEA; text-align: center; font-size: 14px; color: #555;">${item.quantity}</td>
      <td style="padding: 12px 0; border-bottom: 1px solid #EAEAEA; text-align: right; font-size: 14px; font-weight: 600; color: #1B1A18;">₹${item.totalPrice.toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Order Confirmation - Guru Diamonds</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF8F3; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F3; padding: 30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="600" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #FFFFFF; border-radius: 16px; border: 1px solid #E7E1D7; overflow: hidden;">
          <tr>
            <td style="background-color: #2D080C; padding: 28px 24px; text-align: center;">
              <h1 style="margin: 0; color: #D4AF37; font-size: 24px; font-family: Georgia, serif; letter-spacing: 2px;">GURU DIAMONDS</h1>
              <p style="margin: 4px 0 0 0; color: #F7E7CE; font-size: 12px;">ORDER CONFIRMATION</p>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #1B1A18;">Thank you for your order!</h2>
              <p style="margin: 0 0 20px 0; color: #666; font-size: 14px;">Order Number: <strong style="color: #A67C32;">${order.orderNumber}</strong></p>
              
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 24px;">
                <thead>
                  <tr style="border-bottom: 2px solid #2D080C;">
                    <th align="left" style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #888;">Item</th>
                    <th align="center" style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #888;">Qty</th>
                    <th align="right" style="padding-bottom: 8px; font-size: 12px; text-transform: uppercase; color: #888;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <!-- Totals -->
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #FAF8F3; padding: 16px; border-radius: 10px; margin-bottom: 24px;">
                <tr>
                  <td style="color: #666; font-size: 13px; padding: 4px 0;">Subtotal</td>
                  <td align="right" style="font-size: 13px; color: #1B1A18;">₹${order.subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 13px; padding: 4px 0;">GST (3%)</td>
                  <td align="right" style="font-size: 13px; color: #1B1A18;">₹${order.gstTotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td style="color: #666; font-size: 13px; padding: 4px 0;">Insured Shipping</td>
                  <td align="right" style="font-size: 13px; color: #2E7D32; font-weight: 600;">FREE</td>
                </tr>
                ${order.discountAmount > 0 ? `
                <tr>
                  <td style="color: #C62828; font-size: 13px; padding: 4px 0;">Discount</td>
                  <td align="right" style="font-size: 13px; color: #C62828;">-₹${order.discountAmount.toLocaleString('en-IN')}</td>
                </tr>` : ''}
                <tr style="border-top: 1px solid #E0E0E0;">
                  <td style="color: #2D080C; font-size: 16px; font-weight: 700; padding-top: 10px;">Total Amount</td>
                  <td align="right" style="color: #2D080C; font-size: 16px; font-weight: 700; padding-top: 10px;">₹${order.totalAmount.toLocaleString('en-IN')}</td>
                </tr>
              </table>

              <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #1B1A18;">Shipping Address:</h3>
              <p style="margin: 0; color: #666; font-size: 13px; line-height: 1.5;">
                ${order.shippingAddress.fullName}<br>
                ${order.shippingAddress.street}${order.shippingAddress.landmark ? `, ${order.shippingAddress.landmark}` : ''}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
                Phone: ${order.shippingAddress.phone}
              </p>
            </td>
          </tr>
          <tr>
            <td style="background-color: #F6F4EE; padding: 20px; border-top: 1px solid #E7E1D7; text-align: center; color: #888; font-size: 12px;">
              Guru Diamonds - BIS Hallmarked & Certified Natural Diamonds
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to: order.customer.email,
    toName: order.customer.name,
    subject: `Order Confirmation #${order.orderNumber} - Guru Diamonds`,
    html,
    text: `Your Guru Diamonds order #${order.orderNumber} for ₹${order.totalAmount} has been confirmed.`,
    templateName: 'order_confirmation',
    orderId: order.id,
  });
};

/**
 * Sends Shipping & Order Status Updates with Tracking Details
 */
export const sendOrderStatusEmail = async (params: {
  order: Order;
  status: string;
  note?: string;
  trackingNumber?: string;
  courierPartner?: string;
}) => {
  const { order, status, note, trackingNumber, courierPartner } = params;

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0; padding:0; background-color:#FAF8F3; font-family:sans-serif;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="padding:30px 15px;">
    <tr>
      <td align="center">
        <table width="100%" max-width="560" border="0" cellspacing="0" cellpadding="0" style="max-width:560px; background:#fff; border-radius:14px; border:1px solid #E7E1D7; overflow:hidden;">
          <tr>
            <td style="background:#2D080C; padding:24px; text-align:center;">
              <h1 style="margin:0; color:#D4AF37; font-size:22px; font-family:Georgia, serif; letter-spacing:1px;">GURU DIAMONDS</h1>
              <p style="margin:4px 0 0 0; color:#F7E7CE; font-size:12px;">SHIPMENT UPDATE</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              <h2 style="margin:0 0 12px 0; font-size:18px; color:#1B1A18;">Order Status: <span style="color:#A67C32;">${status}</span></h2>
              <p style="color:#555; font-size:14px; line-height:1.5;">Dear ${order.customer.name}, your order <strong>#${order.orderNumber}</strong> has been updated to <strong>${status}</strong>.</p>
              
              ${note ? `<p style="background:#FAF8F3; padding:12px; border-left:3px solid #A67C32; font-size:13px; color:#444;">${note}</p>` : ''}
              
              ${trackingNumber ? `
              <div style="background:#FAF8F3; border:1px solid #E7E1D7; border-radius:10px; padding:16px; margin:20px 0;">
                <p style="margin:0; font-size:13px; color:#666;">Courier Partner: <strong>${courierPartner || 'BlueDart / Sequel Logistics'}</strong></p>
                <p style="margin:6px 0 0 0; font-size:14px; color:#1B1A18;">Tracking AWB: <strong style="color:#2D080C; font-family:monospace;">${trackingNumber}</strong></p>
              </div>` : ''}

              <p style="margin:24px 0 0 0; font-size:13px; color:#777;">You can track your package directly at <a href="${process.env.APP_URL || 'https://gurudiamonds.in'}/track-order" style="color:#A67C32; font-weight:600;">gurudiamonds.in/track-order</a>.</p>
            </td>
          </tr>
          <tr>
            <td style="background:#F6F4EE; padding:16px; text-align:center; font-size:11px; color:#999;">
              Guru Diamonds &bull; Secure Insured Transit &bull; 100% Certified
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to: order.customer.email,
    toName: order.customer.name,
    subject: `Order Update: #${order.orderNumber} is now ${status}`,
    html,
    text: `Your Guru Diamonds order #${order.orderNumber} status has been updated to ${status}.${trackingNumber ? ` Tracking Number: ${trackingNumber}` : ''}`,
    templateName: 'order_status_update',
    orderId: order.id,
  });
};
