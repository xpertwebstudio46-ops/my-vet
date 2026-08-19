import { Router } from 'express'
import { z } from 'zod'
import { prisma } from '../../config/database.js'
import { contactRateLimiter } from '../../shared/middleware/rate-limiter.js'
import { validateBody } from '../../shared/middleware/validate.js'
import { mailService } from '../../shared/services/mail.service.js'
import { sendSuccess } from '../../shared/utils/api-response.js'

const contactSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  phone: z.string().trim().max(30).nullable().optional(),
  subject: z.string().trim().min(3).max(150),
  message: z.string().trim().min(10).max(5_000),
  companyWebsite: z.string().max(0).optional(),
})

export const contactRouter = Router()

contactRouter.post('/', contactRateLimiter, validateBody(contactSchema), async (request, response) => {
  const input = request.validatedBody as z.infer<typeof contactSchema>
  const body = {
    name: input.name,
    email: input.email,
    phone: input.phone,
    subject: input.subject,
    message: input.message,
  }
  const enquiry = await prisma.contactEnquiry.create({ data: body })
  void mailService
    .send({
      to: 'support@myvet.example',
      subject: `New contact enquiry: ${body.subject}`,
      text: `${body.name} (${body.email}) sent: ${body.message}`,
    })
    .catch((error: unknown) => console.error('Contact notification failed', error))
  sendSuccess(response, { id: enquiry.id }, 'Your message has been received', 201)
})
