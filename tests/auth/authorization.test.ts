/**
 * @jest-environment node
 */
import { api } from '../helpers/api';
import { authHeader, tokenFor } from '../helpers/auth';
import { productFactory } from '../helpers/factories';
import { cleanupProduct } from '../helpers/db';
import { prisma } from '../../backend/src/config/db';

describe('Authorization matrix', () => {
  const owner = authHeader(tokenFor({ role: 'OWNER' }));
  const manager = authHeader(tokenFor({ role: 'MANAGER' }));
  const productManager = authHeader(tokenFor({ role: 'PRODUCT_MANAGER' }));
  const staff = authHeader(tokenFor({ role: 'STAFF' }));
  const customer = authHeader(tokenFor({ type: 'CUSTOMER', role: undefined }));
  const product = productFactory();

  beforeAll(async () => {
    await api().post('/api/products').set(owner).send(product).expect(201);
  });

  afterAll(async () => {
    await cleanupProduct(product.id);
    await prisma.$disconnect();
  });

  it('OWNER can access admin customer APIs', async () => {
    await api().get('/api/customers').set(owner).expect(200);
  });

  it('OWNER can access product mutation APIs', async () => {
    await api().put(`/api/products/${product.id}`).set(owner).send({ ...product, name: 'Owner Updated' }).expect(200);
  });

  it('generic MANAGER cannot access owner-only APIs', async () => {
    await api().get('/api/customers').set(manager).expect(403);
  });

  it('implemented PRODUCT_MANAGER can update products', async () => {
    await api().put(`/api/products/${product.id}`).set(productManager).send({ ...product, name: 'Manager Updated' }).expect(200);
  });

  it('STAFF cannot delete products', async () => {
    await api().delete(`/api/products/${product.id}`).set(staff).expect(403);
  });

  it('CUSTOMER cannot access admin APIs', async () => {
    await api().get('/api/customers').set(customer).expect(403);
  });

  it('missing JWT cannot access sensitive endpoints', async () => {
    await api().get('/api/orders').expect(401);
  });
});
