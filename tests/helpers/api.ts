import request from 'supertest';
import { app } from '../../backend/src/app';

export const api = () => request(app);
