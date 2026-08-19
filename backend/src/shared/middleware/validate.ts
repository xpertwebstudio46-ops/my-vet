import type { NextFunction, Request, Response } from 'express'
import type { ZodType } from 'zod'
import { ApiError } from '../utils/api-error.js'

type Target = 'validatedBody' | 'validatedQuery' | 'validatedParams'

function validate(schema: ZodType, source: 'body' | 'query' | 'params', target: Target) {
  return (request: Request, _response: Response, next: NextFunction) => {
    const result = schema.safeParse(request[source])
    if (!result.success) {
      const details: Record<string, string[]> = {}
      for (const issue of result.error.issues) {
        const key = issue.path.join('.') || source
        details[key] ??= []
        details[key].push(issue.message)
      }
      next(new ApiError(400, 'VALIDATION_ERROR', 'Request validation failed', details))
      return
    }

    request[target] = result.data
    next()
  }
}

export const validateBody = (schema: ZodType) => validate(schema, 'body', 'validatedBody')
export const validateQuery = (schema: ZodType) => validate(schema, 'query', 'validatedQuery')
export const validateParams = (schema: ZodType) => validate(schema, 'params', 'validatedParams')
