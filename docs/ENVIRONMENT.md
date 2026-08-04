# Environment Configuration

Create `.env` locally from `.env.example`.

## Required

```env
APP_URL="http://localhost:3000"
VITE_API_URL="http://localhost:5000/api"
PORT="5000"
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/gurudimonds?schema=public"
JWT_SECRET="replace-with-a-long-random-secret"
```

If a password contains special characters such as `@`, encode it in the URL. Example: `Abcd@123` becomes `Abcd%40123`.

## Optional Payments

```env
RAZORPAY_KEY_ID=""
RAZORPAY_KEY_SECRET=""
RAZORPAY_WEBHOOK_SECRET=""
```

Without these values, Razorpay endpoints run as a local scaffold only.

## Optional Email

```env
EMAIL_PROVIDER="log"
SMTP_HOST=""
SMTP_PORT=""
SMTP_USER=""
SMTP_PASS=""
FROM_EMAIL="info@gurudimonds.in"
```

Phase 4 stores email intent records in `EmailLog`. A real SMTP/provider sender can be attached later.
