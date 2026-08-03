/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { authHeader, tokenFor } from '../helpers/auth';
import { cleanupProduct } from '../helpers/db';
import { categoryFactory, collectionFactory, productFactory } from '../helpers/factories';
import { prisma } from '../../backend/src/config/db';

describe('Catalog APIs', () => {
  const owner = authHeader(tokenFor({ role: 'OWNER' }));
  const manager = authHeader(tokenFor({ role: 'PRODUCT_MANAGER' }));
  const staff = authHeader(tokenFor({ role: 'STAFF' }));
  const product = productFactory();

  afterAll(async () => {
    await cleanupProduct(product.id);
    await prisma.category.deleteMany({ where: { id: { startsWith: 'jest-cat' } } });
    await prisma.jewelleryCollection.deleteMany({ where: { id: { startsWith: 'jest-col' } } });
    await prisma.$disconnect();
  });

  it('GET /api/products returns products', async () => {
    const response = await api().get('/api/products').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('GET /api/products supports search filtering without SQL injection side effects', async () => {
    const response = await api().get('/api/products').query({ search: "'; DROP TABLE Product; --" }).expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('POST /api/products creates a product for OWNER', async () => {
    const response = await api().post('/api/products').set(owner).send(product).expect(201);

    expect(response.body.id).toBe(product.id);
    expect(response.body.slug).toBe(product.slug);
  });

  it('GET /api/products/:slug returns product by slug', async () => {
    const response = await api().get(`/api/products/${product.slug}`).expect(200);

    expect(response.body.id).toBe(product.id);
  });

  it('PUT /api/products/:id updates a product for PRODUCT_MANAGER', async () => {
    const response = await api()
      .put(`/api/products/${product.id}`)
      .set(manager)
      .send({ ...product, name: 'Jest Updated Diamond' })
      .expect(200);

    expect(response.body.name).toBe('Jest Updated Diamond');
  });

  it('DELETE /api/products/:id denies STAFF', async () => {
    await api().delete(`/api/products/${product.id}`).set(staff).expect(403);
  });

  it('GET /api/products/:slug returns 404 for invalid slug', async () => {
    const response = await api().get('/api/products/does-not-exist-jest').expect(404);

    expect(response.body.message).toMatch(/Product not found/i);
  });

  it('DELETE /api/products/:id deletes a product for OWNER', async () => {
    await api().delete(`/api/products/${product.id}`).set(owner).expect(204);
  });

  it('GET /api/categories returns categories', async () => {
    const response = await api().get('/api/categories').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /api/categories/:id upserts a category for OWNER', async () => {
    const category = categoryFactory();
    const response = await api().put(`/api/categories/${category.id}`).set(owner).send(category).expect(200);

    expect(response.body.id).toBe(category.id);
  });

  it('GET /api/collections returns collections', async () => {
    const response = await api().get('/api/collections').expect(200);

    expect(Array.isArray(response.body)).toBe(true);
  });

  it('PUT /api/collections/:id upserts a collection for OWNER', async () => {
    const collection = collectionFactory();
    const response = await api().put(`/api/collections/${collection.id}`).set(owner).send(collection).expect(200);

    expect(response.body.id).toBe(collection.id);
  });
});
