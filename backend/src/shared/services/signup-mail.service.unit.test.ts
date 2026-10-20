import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('../../config/env.js', () => ({
  env: { SIGNUP_NOTIFICATION_EMAIL: 'hello@my-vet.co.uk' },
  frontendOrigins: ['https://my-vet.co.uk', 'https://test.my-vet.co.uk'],
}))
vi.mock('./mail.service.js', () => ({ mailService: { send: mocks.send } }))

import { sendSignupEmails } from './signup-mail.service.js'

describe('signup emails', () => {
  const user = { id: 'user-1', email: 'new@example.com', firstName: 'New', lastName: 'Member', role: 'PET_OWNER' as const, approvalStatus: 'PENDING' }

  beforeEach(() => {
    mocks.send.mockReset().mockResolvedValue(undefined)
  })
  afterEach(() => vi.restoreAllMocks())

  it('welcomes pending pet owners without promising immediate access and alerts the platform inbox', async () => {
    await sendSignupEmails(user)
    expect(mocks.send).toHaveBeenCalledTimes(2)
    expect(mocks.send).toHaveBeenNthCalledWith(1, expect.objectContaining({
      to: user.email,
      text: expect.stringContaining('https://my-vet.co.uk/?login=pet-owner'),
    }))
    expect(mocks.send.mock.calls[0]?.[0].text).toContain('awaiting admin approval')
    expect(mocks.send).toHaveBeenNthCalledWith(2, expect.objectContaining({
      to: 'hello@my-vet.co.uk',
      text: expect.stringContaining('Email: new@example.com'),
    }))
    expect(mocks.send.mock.calls[1]?.[0].text).toContain('/admin-dashboard/pet-owner')
  })

  it('uses vet login and administration links for vet signups', async () => {
    await sendSignupEmails({ ...user, role: 'VET', approvalStatus: 'APPROVED' })
    expect(mocks.send.mock.calls[0]?.[0].text).toContain('https://my-vet.co.uk/?login=vet')
    expect(mocks.send.mock.calls[0]?.[0].text).not.toContain('awaiting admin approval')
    expect(mocks.send.mock.calls[1]?.[0].subject).toContain('vet practice')
    expect(mocks.send.mock.calls[1]?.[0].text).toContain('/admin-dashboard/veterinary-practice')
  })

  it.each([0, 1])('still attempts both deliveries and preserves signup when email %i fails', async (failedIndex) => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined)
    mocks.send.mockImplementation(async (message) => {
      if (message.to === (failedIndex === 0 ? user.email : 'hello@my-vet.co.uk')) throw new Error('Provider unavailable')
    })
    await expect(sendSignupEmails(user)).resolves.toBeUndefined()
    expect(mocks.send).toHaveBeenCalledTimes(2)
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining('delivery failed for user user-1'))
  })
})
