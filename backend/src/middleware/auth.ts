import jwt from 'jsonwebtoken';
import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env';
import { HttpError } from '../utils/http';

export type AuthUserType = 'CUSTOMER' | 'ADMIN';

export interface AuthTokenPayload {
  sub: string;
  type: AuthUserType;
  role?: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthTokenPayload;
    }
  }
}

export const signAuthToken = (payload: AuthTokenPayload) =>
  jwt.sign(payload, env.jwtSecret, {
    expiresIn: '8h',
  });

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    next(new HttpError(401, 'Authentication required'));
    return;
  }

  try {
    req.auth = jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
    next();
  } catch {
    next(new HttpError(401, 'Invalid or expired session'));
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }
    if (req.auth?.type !== 'ADMIN') {
      next(new HttpError(403, 'Admin access required'));
      return;
    }
    next();
  });
};

export const requireCustomer = (req: Request, res: Response, next: NextFunction) => {
  requireAuth(req, res, (error?: unknown) => {
    if (error) {
      next(error);
      return;
    }
    if (req.auth?.type !== 'CUSTOMER') {
      next(new HttpError(403, 'Customer access required'));
      return;
    }
    next();
  });
};

export const requireRole =
  (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    requireAdmin(req, res, (error?: unknown) => {
      if (error) {
        next(error);
        return;
      }
      if (!req.auth?.role || !roles.includes(req.auth.role)) {
        next(new HttpError(403, 'You do not have permission to perform this action'));
        return;
      }
      next();
    });
  };

