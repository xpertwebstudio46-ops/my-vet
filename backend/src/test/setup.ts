import 'dotenv/config'

process.env.NODE_ENV ??= 'test'
process.env.DATABASE_URL ??= 'postgresql://test:test@localhost:5433/myvet_test'
process.env.JWT_ACCESS_SECRET ??= 'test-access-secret-with-more-than-32-characters'
process.env.JWT_REFRESH_SECRET ??= 'test-refresh-secret-with-more-than-32-characters'

if (process.env.RUN_INTEGRATION_TESTS === 'true') {
  const databaseUrl = process.env.DATABASE_URL
  const testUrl = process.env.DATABASE_URL_TEST

  if (!testUrl) {
    throw new Error('DATABASE_URL_TEST is required for integration tests')
  }

  if (databaseUrl && databaseUrl === testUrl && process.env.NODE_ENV !== 'test') {
    throw new Error('Integration tests cannot use the configured application database')
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('Integration tests are disabled in production')
  }

  process.env.DATABASE_URL = testUrl
}
