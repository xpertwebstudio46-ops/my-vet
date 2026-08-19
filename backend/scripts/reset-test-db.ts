import 'dotenv/config'
import { execFileSync } from 'node:child_process'

const applicationUrl = process.env.DATABASE_URL
const testUrl = process.env.DATABASE_URL_TEST

if (process.env.NODE_ENV === 'production') throw new Error('Test database reset is disabled in production')
if (!testUrl) throw new Error('DATABASE_URL_TEST is required')
if (testUrl === applicationUrl) throw new Error('Test database must differ from the application database')
if (!/test/i.test(testUrl)) throw new Error('Refusing to reset a database URL that is not clearly marked as a test database')

execFileSync('npx', ['prisma', 'migrate', 'reset', '--force', '--skip-seed'], {
  stdio: 'inherit',
  env: { ...process.env, DATABASE_URL: testUrl },
  shell: process.platform === 'win32',
})
