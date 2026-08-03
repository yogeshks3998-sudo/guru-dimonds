# Guru Diamonds Jest Test Setup

The Jest setup loads `jest-dom`, browser API shims, stable test environment variables, and local/session storage cleanup before every test.

Run suites from the project root:

```bash
npm test
npm run test:watch
npm run test:coverage
npm run test:api
npm run test:frontend
npm run test:backend
npm run test:auth
```

Coverage output is generated in `coverage/` with terminal, HTML, LCOV, and JSON summary reports.
