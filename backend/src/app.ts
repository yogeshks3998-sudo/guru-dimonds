import cors from 'cors';
import express, { type NextFunction, type Request, type Response } from 'express';
import { catalogRouter } from './routes/catalog';
import { contentRouter } from './routes/content';
import { couponsRouter } from './routes/coupons';
import { customersRouter } from './routes/customers';
import { healthRouter } from './routes/health';
import { ordersRouter } from './routes/orders';
import { ratesRouter } from './routes/rates';
import { HttpError } from './utils/http';

export const app = express();

app.use(cors());
app.use(express.json({ limit: '5mb' }));

app.use('/api/health', healthRouter);
app.use('/api', catalogRouter);
app.use('/api', contentRouter);
app.use('/api', couponsRouter);
app.use('/api', customersRouter);
app.use('/api', ordersRouter);
app.use('/api', ratesRouter);

app.use((_req, _res, next) => {
  next(new HttpError(404, 'API route not found'));
});

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  const status = err instanceof HttpError ? err.status : 500;
  res.status(status).json({
    message: err.message || 'Unexpected server error',
  });
});

