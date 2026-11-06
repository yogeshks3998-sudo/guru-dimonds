import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import path from 'node:path';
import { env } from './config/env';
import { authRouter } from './routes/auth';
import { cartRouter } from './routes/cart';
import { catalogRouter } from './routes/catalog';
import { checkoutRouter } from './routes/checkout';
import { contentRouter } from './routes/content';
import { couponsRouter } from './routes/coupons';
import { customersRouter } from './routes/customers';
import { healthRouter } from './routes/health';
import { ordersRouter } from './routes/orders';
import { paymentsRouter } from './routes/payments';
import { ratesRouter } from './routes/rates';
import { wishlistRouter } from './routes/wishlist';
import { invoicesRouter } from './routes/invoices';
import { pricingRouter } from './routes/pricing';
import { HttpError } from './utils/http';

export const app = express();

const configuredOrigins = [
  env.appUrl,
  'https://gurudiamonds.in',
  'https://www.gurudiamonds.in',
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5000',
  'http://localhost:5055',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:5055',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (e.g. server-to-server Razorpay webhooks, curl, Jest test runner)
      if (!origin) {
        callback(null, true);
        return;
      }
      if (
        configuredOrigins.includes(origin) ||
        (env.nodeEnv !== 'production' && /^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin))
      ) {
        callback(null, true);
        return;
      }
      callback(new HttpError(403, `CORS policy: origin ${origin} is not allowed`));
    },
    credentials: true,
  })
);
app.use('/products', express.static(path.resolve('public/products')));
app.use('/categories', express.static(path.resolve('public/categories')));
app.use('/api/payments/webhook/razorpay', express.raw({ type: 'application/json' }));
app.use(express.json({ limit: '15mb' }));
app.use('/api/health', healthRouter);
app.use('/api', authRouter);
app.use('/api', cartRouter);
app.use('/api', catalogRouter);
app.use('/api', checkoutRouter);
app.use('/api', contentRouter);
app.use('/api', couponsRouter);
app.use('/api', customersRouter);
app.use('/api', ordersRouter);
app.use('/api', paymentsRouter);
app.use('/api', ratesRouter);
app.use('/api', wishlistRouter);
app.use('/api', invoicesRouter);
app.use('/api', pricingRouter);

app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    next(new HttpError(404, 'API route not found'));
    return;
  }

  next();
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Backend Request Error:', err);
  const status = err instanceof HttpError ? err.status : 500;
  const message = err.message || 'Unexpected server error';

  res.status(status).json({
    message,
  });
});
