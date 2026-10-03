import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    // Applied before any test file loads: an in-memory database, and "test" mode
    // (which also switches off the login rate limiter).
    env: { DB_PATH: ':memory:', NODE_ENV: 'test' },
  },
});
