import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocks = vi.hoisted(() => ({
  findToken: vi.fn(),
  consumeToken: vi.fn(),
  updateUser: vi.fn(),
  revokeSessions: vi.fn(),
  findUser: vi.fn(),
  transaction: vi.fn(),
  send: vi.fn(),
  hash: vi.fn(),
  invalidate: vi.fn(),
}))

vi.mock('../../config/database.js', () => ({ prisma: {
  user: { findFirst: mocks.findUser },
  passwordResetToken: { findUnique: mocks.findToken },
  $transaction: mocks.transaction,
} }))
vi.mock('../../shared/services/mail.service.js', () => ({ mailService: { send: mocks.send } }))
vi.mock('bcryptjs', () => ({ default: { hash: mocks.hash } }))
vi.mock('./user-auth-cache.js', () => ({ invalidateAuthUser: mocks.invalidate }))

import { requestPasswordReset, resetPassword } from './auth.service.js'

describe('password reset safeguards', () => {
  const input = { token: 'test-token', password: 'NewPassword123' }
  const record = { id: 'reset-id', userId: 'pet-owner-id', usedAt: null, expiresAt: new Date(Date.now() + 30 * 60_000) }

  beforeEach(() => {
    vi.resetAllMocks()
    mocks.findToken.mockResolvedValue(record)
    mocks.hash.mockResolvedValue('new-password-hash')
    mocks.consumeToken.mockResolvedValue({ count: 1 })
    mocks.transaction.mockImplementation(async (callback) => callback({
      passwordResetToken: { updateMany: mocks.consumeToken },
      user: { update: mocks.updateUser },
      refreshToken: { updateMany: mocks.revokeSessions },
    }))
  })

  it('updates only the password, consumes the link and revokes old refresh sessions', async () => {
    await resetPassword(input)
    expect(mocks.updateUser).toHaveBeenCalledWith({ where: { id: 'pet-owner-id' }, data: { passwordHash: 'new-password-hash' } })
    expect(mocks.consumeToken).toHaveBeenCalledWith(expect.objectContaining({
      where: expect.objectContaining({ id: 'reset-id', usedAt: null, expiresAt: { gt: expect.any(Date) } }),
      data: { usedAt: expect.any(Date) },
    }))
    expect(mocks.revokeSessions).toHaveBeenCalledWith(expect.objectContaining({ where: { userId: 'pet-owner-id', revokedAt: null } }))
    expect(mocks.invalidate).toHaveBeenCalledWith('pet-owner-id')
  })

  it.each([
    ['missing', null],
    ['used', { ...record, usedAt: new Date() }],
    ['expired', { ...record, expiresAt: new Date(Date.now() - 1000) }],
  ])('rejects a %s link without updating the password', async (_label, token) => {
    mocks.findToken.mockResolvedValue(token)
    await expect(resetPassword(input)).rejects.toMatchObject({ code: 'INVALID_RESET_TOKEN' })
    expect(mocks.transaction).not.toHaveBeenCalled()
    expect(mocks.updateUser).not.toHaveBeenCalled()
  })

  it('prevents two simultaneous submissions from consuming the same link', async () => {
    mocks.consumeToken.mockResolvedValue({ count: 0 })
    await expect(resetPassword(input)).rejects.toMatchObject({ code: 'INVALID_RESET_TOKEN' })
    expect(mocks.updateUser).not.toHaveBeenCalled()
    expect(mocks.revokeSessions).not.toHaveBeenCalled()
  })

  it('does not send mail or create a token for an unknown email', async () => {
    mocks.findUser.mockResolvedValue(null)
    await requestPasswordReset('unknown@example.com')
    expect(mocks.send).not.toHaveBeenCalled()
    expect(mocks.transaction).not.toHaveBeenCalled()
  })
})
