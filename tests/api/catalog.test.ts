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

  it('GET /api/products handles special-character searches without server errors', async () => {
    const response = await api().get('/api/products').query({ search: '@#$%^' }).expect(200);

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

  it('PUT /api/products/:id updates products that include existing variant relation fields', async () => {
    const variantProduct = productFactory({
      id: 'jest-prod-with-variant',
      slug: 'jest-prod-with-variant',
      sku: 'JEST-PROD-WITH-VARIANT',
      variants: [
        {
          id: 'jest-variant-existing',
          sku: 'JEST-PROD-WITH-VARIANT-DEFAULT',
          barcode: 'JEST-PROD-WITH-VARIANT',
          attributes: { Gemstone: 'Ruby' },
          price: 1000,
          netWeightGrams: 0,
          grossWeightGrams: 0,
          stock: 1,
          images: [],
          enabled: true,
          dispatchTimeDays: 7,
        },
      ],
    });

    await cleanupProduct(variantProduct.id);
    await api().post('/api/products').set(owner).send(variantProduct).expect(201);

    const fetched = await api().get(`/api/products/${variantProduct.slug}`).expect(200);
    expect(fetched.body.variants[0].productId).toBe(variantProduct.id);

    const response = await api()
      .put(`/api/products/${variantProduct.id}`)
      .set(manager)
      .send({ ...fetched.body, name: 'Jest Updated Variant Product' })
      .expect(200);

    expect(response.body.name).toBe('Jest Updated Variant Product');
    expect(response.body.variants).toHaveLength(1);

    await cleanupProduct(variantProduct.id);
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
