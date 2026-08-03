/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { prisma } from '../../backend/src/config/db';
import { mockFetchReject } from '../helpers/mockFetch';
import { useProductStore } from '../../src/stores/useProductStore';

describe('API failure and fallback behavior', () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it('returns 500 when database dependency fails', async () => {
    jest.spyOn(prisma.product, 'findMany').mockRejectedValueOnce(new Error('database offline'));

    const response = await api().get('/api/products').expect(500);
    expect(response.body.message).toMatch(/database offline/i);
  });

  it('returns 404 for invalid product IDs/slugs', async () => {
    await api().get('/api/products/not-a-real-product').expect(404);
  });

  it('frontend gracefully falls back when backend is offline', async () => {
    mockFetchReject(new Error('backend offline'));

    await useProductStore.getState().hydrateProducts();

    expect(useProductStore.getState().error).toMatch(/backend offline/i);
    expect(useProductStore.getState().products.length).toBeGreaterThan(0);
  });

  it('frontend records network timeout failures', async () => {
    mockFetchReject(new Error('Network timeout'));

    await useProductStore.getState().hydrateProducts();

    expect(useProductStore.getState().error).toMatch(/Network timeout/i);
  });
});
