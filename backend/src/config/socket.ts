import type { Server as HttpServer } from 'node:http'
import { Server as SocketServer } from 'socket.io'
import { frontendOrigins } from './env.js'
import { notificationEvents } from '../shared/services/notification.service.js'
import { verifyAccessToken } from '../modules/auth/token.service.js'
import { getCurrentAuthUser } from '../modules/auth/user-auth-cache.js'

export function attachSocket(server: HttpServer) {
  const io = new SocketServer(server, { cors: { origin: frontendOrigins, credentials: true } })
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token
      if (typeof token !== 'string') throw new Error('Missing token')
      const payload = verifyAccessToken(token)
      const user = await getCurrentAuthUser(payload.sub)
      if (!user || user.role !== payload.role) throw new Error('Invalid session')
      socket.data.userId = user.id
      next()
    } catch {
      next(new Error('Authentication required'))
    }
  })
  io.on('connection', (socket) => {
    const userId = socket.data.userId as string
    void socket.join(`user:${userId}`)
  })
  notificationEvents.on('notification', (notification: { userId: string }) => {
    io.to(`user:${notification.userId}`).emit('notification:new', notification)
  })
  return io
}
