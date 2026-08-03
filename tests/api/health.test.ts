/**
 * @jest-environment node
 */
import { api } from '../helpers/api';

describe('Health API', () => {
  it('GET /api/health returns service health', async () => {
    const response = await api().get('/api/health').expect(200);

    expect(response.body).toEqual({ ok: true, service: 'guru-diamonds-api' });
  });

  it('returns JSON 404 for unknown API routes', async () => {
    const response = await api().get('/api/not-real').expect(404);

    expect(response.body.message).toMatch(/API route not found/i);
  });
});
