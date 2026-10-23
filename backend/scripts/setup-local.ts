import 'dotenv/config'
import { execFileSync } from 'node:child_process'
import pg from 'pg'

function localUrl(value: string | undefined, label: string) {
  if (!value) throw new Error(`Set ${label} in backend/.env first`)
  const url = new URL(value)
  if (!['postgres:', 'postgresql:'].includes(url.protocol) || !['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)) {
    throw new Error(`${label} must point to local PostgreSQL`)
  }
  return url
}

async function main() {
  if (process.env.NODE_ENV !== 'development') throw new Error('Local setup requires NODE_ENV=development')
  const target = localUrl(process.env.DATABASE_URL, 'DATABASE_URL')
  const adminUrl = localUrl(process.env.LOCAL_POSTGRES_ADMIN_URL, 'LOCAL_POSTGRES_ADMIN_URL')
  const database = decodeURIComponent(target.pathname.slice(1))
  const username = decodeURIComponent(target.username)
  const password = decodeURIComponent(target.password)
  if (database !== 'myvet_local' || username !== 'myvet_local') {
    throw new Error('Local setup requires database and username myvet_local')
  }
  if (!password) throw new Error('DATABASE_URL must include a password')
  if (target.hostname !== adminUrl.hostname || target.port !== adminUrl.port) {
    throw new Error('Both URLs must use the same PostgreSQL host and port')
  }
  const client = new pg.Client({ connectionString: adminUrl.href, connectionTimeoutMillis: 5000 })
  await client.connect()
  try {
    // Fixed identifiers; quote the generated password as a PostgreSQL string literal.
    const literal = "'" + password.replaceAll("'", "''") + "'"
    const role = await client.query('SELECT 1 FROM pg_roles WHERE rolname = $1', [username])
    if (!role.rowCount) await client.query(`CREATE ROLE myvet_local LOGIN PASSWORD ${literal}`)
    const db = await client.query('SELECT 1 FROM pg_database WHERE datname = $1', [database])
    if (!db.rowCount) await client.query('CREATE DATABASE myvet_local OWNER myvet_local')
  } finally {
    await client.end()
  }
  const appClient = new pg.Client({ connectionString: target.href, connectionTimeoutMillis: 5000 })
  await appClient.connect()
  await appClient.end()
  for (const script of ['db:generate', 'db:migrate:deploy', 'db:seed']) {
    execFileSync('npm', ['run', script], { stdio: 'inherit', shell: process.platform === 'win32' })
  }
  console.log('Local database ready. Run npm run dev in backend, then npm run dev in the project root.')
}

main().catch((error: unknown) => {
  // Never print connection URLs or credentials.
  console.error(error instanceof Error ? error.message : 'Local database setup failed')
  process.exitCode = 1
})
