/**
 * @jest-environment node
 */
import { api } from '../helpers/api';

describe('Performance smoke tests', () => {
  const expectUnder = async (name: string, fn: () => Promise<unknown>, maxMs: number) => {
    const startedAt = performance.now();
    await fn();
    const duration = performance.now() - startedAt;
    expect(duration).toBeLessThan(maxMs);
    expect(name).toBeTruthy();
  };

  it('GET /api/health responds quickly', async () => {
    await expectUnder('health', () => api().get('/api/health').expect(200), 500);
  });

  it('large product list endpoint responds within smoke threshold', async () => {
    await expectUnder('products', () => api().get('/api/products').expect(200), 2500);
  });

  it('search filtering responds within smoke threshold', async () => {
    await expectUnder('search', () => api().get('/api/products').query({ search: 'diamond' }).expect(200), 2500);
  });

  it('category filtering responds within smoke threshold', async () => {
    await expectUnder('filtering', () => api().get('/api/products').query({ category: 'Gemstones' }).expect(200), 2500);
  });

  it('pagination contract can be measured even when API ignores pagination params', async () => {
    await expectUnder('pagination', () => api().get('/api/products').query({ page: 1, limit: 20 }).expect(200), 2500);
  });
});
