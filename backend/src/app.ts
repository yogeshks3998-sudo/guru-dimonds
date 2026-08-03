import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
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
import { HttpError } from './utils/http';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

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

app.use((req, _res, next) => {
  if (req.path.startsWith('/api')) {
    next(new HttpError(404, 'API route not found'));
    return;
  }

  next();
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  res.status(status).json({
    message: err.message || 'Unexpected server error',
  });
});
