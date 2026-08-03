# Guru Diamonds Test Architecture

This folder contains the Jest testing framework for Guru Diamonds.

## Structure

- `unit/`: React component and Zustand store unit tests.
- `integration/`: cross-layer fallback and error-path tests.
- `api/`: Express API endpoint tests with Supertest.
- `frontend/`: page rendering tests with React Testing Library.
- `backend/`: backend domain logic tests.
- `auth/`: authentication, JWT, and authorization matrix tests.
- `database/`: Prisma/PostgreSQL integration checks.
- `helpers/`: shared factories, auth helpers, render wrappers, and fetch mocks.
- `setup/`: global Jest setup and notes.

## Commands

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:api
npm run test:frontend
npm run test:backend
npm run test:auth
```

## Coverage

Coverage reports are written to `coverage/`:

- terminal summary
- HTML report
- LCOV report
- JSON summary

The production target is 95%+ coverage. Use `npm run test:coverage` during CI and before release hardening.

## Database Notes

Database integration tests use Prisma and the configured `DATABASE_URL`. They do not mock Prisma. Test-created records use `jest-*` IDs and clean up after themselves.

## Mocking Strategy

- Network calls are mocked with `tests/helpers/mockFetch.ts` for frontend/store tests.
- JWTs are generated with the app secret for realistic auth middleware coverage.
- Browser APIs such as `matchMedia`, `ResizeObserver`, and `scrollTo` are shimmed in `tests/setup/jest.setup.ts`.
- Prisma is not mocked in `database/`; targeted integration failure tests may temporarily spy on one Prisma method to simulate database outage behavior.
