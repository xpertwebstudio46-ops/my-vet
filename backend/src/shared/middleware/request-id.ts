import { randomUUID } from 'node:crypto'
import type { NextFunction, Request, Response } from 'express'

export function requestId(request: Request, response: Response, next: NextFunction) {
  const incoming = request.get('x-request-id')
  request.requestId = incoming && incoming.length <= 100 ? incoming : randomUUID()
  response.setHeader('x-request-id', request.requestId)
  next()
}
