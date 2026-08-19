import process from 'node:process'

const apiUrl = (process.env.API_URL ?? '').replace(/\/$/, '')
if (!apiUrl.startsWith('https://') && !apiUrl.startsWith('http://localhost')) {
  throw new Error('API_URL must use HTTPS (localhost HTTP is allowed)')
}

async function check(path: string) {
  const response = await fetch(`${apiUrl}${path}`, { signal: AbortSignal.timeout(10_000) })
  const body: unknown = await response.json()
  if (!response.ok) throw new Error(`${path} returned ${response.status}: ${JSON.stringify(body)}`)
  console.info(`${path}: ${response.status}`)
}

await check('/api/health')
await check('/api/readiness')
await check('/api/subscriptions/plans')
await check('/api/blog?page=1&limit=1')
console.info('Non-destructive smoke checks passed')
