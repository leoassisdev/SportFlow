// Env de teste — carregado antes das suites.
process.env.NODE_ENV ??= 'test';
process.env.DATABASE_URL ??= 'postgresql://sportflow:sportflow_dev@localhost:5432/sportflow_test';
process.env.REDIS_URL ??= 'redis://localhost:6379';
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-com-32-caracteres-ok-1234567890';
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-com-32-caracteres-ok-1234567890';
process.env.CORS_ORIGINS ??= 'http://localhost:3000';
