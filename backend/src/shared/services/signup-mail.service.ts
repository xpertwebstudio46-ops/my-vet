import { env, frontendOrigins } from '../../config/env.js'
import { mailService, type MailMessage } from './mail.service.js'

type SignupUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'PET_OWNER' | 'VET'
  approvalStatus: string
}

export async function sendSignupEmails(user: SignupUser) {
  const isPetOwner = user.role === 'PET_OWNER'
  const roleLabel = isPetOwner ? 'pet owner' : 'vet practice'
  const loginUrl = new URL('/', frontendOrigins[0])
  loginUrl.searchParams.set('login', isPetOwner ? 'pet-owner' : 'vet')
  const adminUrl = new URL(isPetOwner ? '/admin-dashboard/pet-owner' : '/admin-dashboard/veterinary-practice', frontendOrigins[0])
  const pendingApproval = isPetOwner && user.approvalStatus !== 'APPROVED'
  const messages: MailMessage[] = [
    {
      to: user.email,
      subject: 'Welcome to My Vet',
      text: [
        `Hi ${user.firstName},`,
        `Thank you for joining My Vet as a ${roleLabel}. Your account has been created.`,
        pendingApproval
          ? 'Your pet-owner account is awaiting admin approval. Once approved, you can sign in using the link below.'
          : 'You can sign in to your account using the link below.',
        loginUrl.toString(),
        'The My Vet team',
      ].join('\n\n'),
    },
    {
      to: env.SIGNUP_NOTIFICATION_EMAIL,
      subject: `New My Vet signup: ${roleLabel}`,
      text: [
        `A new ${roleLabel} account has joined My Vet.`,
        `Name: ${user.firstName} ${user.lastName}`,
        `Email: ${user.email}`,
        `Account type: ${roleLabel}`,
        `Approval status: ${user.approvalStatus}`,
        'For vet accounts, practice details may still need to be completed.',
        `Manage accounts: ${adminUrl.toString()}`,
      ].join('\n'),
    },
  ]

  // Accounts are already saved. A failed email must not turn signup into an error.
  const deliveries = await Promise.allSettled(messages.map((message) => mailService.send(message)))
  deliveries.forEach((delivery, index) => {
    if (delivery.status === 'rejected') {
      console.error(`[signup-mail] ${index === 0 ? 'Welcome' : 'Admin notification'} delivery failed for user ${user.id}`)
    }
  })
}
