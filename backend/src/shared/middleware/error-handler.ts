import type { ErrorRequestHandler, RequestHandler } from 'express'
import multer from 'multer'
import { Prisma } from '../../generated/prisma/client.js'
import { ApiError } from '../utils/api-error.js'
import { sendError } from '../utils/api-response.js'

export const notFound: RequestHandler = (request, response) => {
  sendError(response, 404, 'NOT_FOUND', 'Route not found', request.requestId)
}

export const errorHandler: ErrorRequestHandler = (error: unknown, request, response, _next) => {
  void _next
  if (error instanceof ApiError) {
    sendError(response, error.statusCode, error.code, error.message, request.requestId, error.details)
    return
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      sendError(response, 409, 'CONFLICT', 'A record with these values already exists', request.requestId)
      return
    }
    if (error.code === 'P2003') {
      sendError(response, 409, 'RELATED_RECORD_CONFLICT', 'A related record prevents this operation', request.requestId)
      return
    }
    if (error.code === 'P2025') {
      sendError(response, 404, 'NOT_FOUND', 'The requested record was not found', request.requestId)
      return
    }
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    sendError(response, 400, 'INVALID_DATABASE_INPUT', 'Invalid data supplied', request.requestId)
    return
  }

  if (error instanceof multer.MulterError) {
    const status = error.code === 'LIMIT_FILE_SIZE' ? 413 : 400
    sendError(response, status, 'UPLOAD_ERROR', 'The upload could not be accepted', request.requestId)
    return
  }

  if (error instanceof SyntaxError && 'body' in error) {
    sendError(response, 400, 'MALFORMED_JSON', 'Request body contains invalid JSON', request.requestId)
    return
  }

  console.error(`[${request.requestId}]`, error)
  sendError(response, 500, 'INTERNAL_ERROR', 'An unexpected error occurred', request.requestId)
}
