import { createServer } from 'node:http'
import { app } from './app.js'
import { prisma } from './config/database.js'
import { env } from './config/env.js'
import { attachSocket } from './config/socket.js'

const server = createServer(app)
const io = attachSocket(server)

server.listen(env.PORT, () => {
  console.log(`My Vet API listening on port ${env.PORT}`)
})

let shuttingDown = false

async function shutdown(signal: string) {
  if (shuttingDown) return
  shuttingDown = true
  console.log(`${signal} received; shutting down`)

  const fallback = setTimeout(() => process.exit(1), 10_000)
  fallback.unref()

  io.close(() => undefined)
  server.close(async () => {
    await prisma.$disconnect()
    clearTimeout(fallback)
    process.exit(0)
  })
}

process.on('SIGTERM', () => void shutdown('SIGTERM'))
process.on('SIGINT', () => void shutdown('SIGINT'))
