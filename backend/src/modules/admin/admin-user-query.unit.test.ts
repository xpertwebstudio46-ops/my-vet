import { describe, expect, it } from 'vitest'
import { userQuery, userWhere } from './admin-user-query.js'

describe('admin user registration filters', () => {
  it('selects veterinary accounts without a practice using the relation filter', () => {
    const query = userQuery.parse({ role: 'VET', practiceRegistration: 'INCOMPLETE' })
    expect(userWhere(query)).toEqual({ role: 'VET', practice: { is: null } })
  })

  it.each(['PET_OWNER', 'ADMIN', undefined])('rejects incomplete practice filters for role %s', (role) => {
    expect(userQuery.safeParse({ role, practiceRegistration: 'INCOMPLETE' }).success).toBe(false)
  })

  it('combines name/email search with the incomplete filter', () => {
    const where = userWhere(userQuery.parse({ role: 'VET', practiceRegistration: 'INCOMPLETE', q: ' Latta ' }))
    expect(where).toMatchObject({ role: 'VET', practice: { is: null }, OR: [
      { email: { contains: 'Latta', mode: 'insensitive' } },
      { firstName: { contains: 'Latta', mode: 'insensitive' } },
      { lastName: { contains: 'Latta', mode: 'insensitive' } },
    ] })
  })

  it('preserves existing pet-owner and approval filters', () => {
    expect(userWhere(userQuery.parse({ role: 'PET_OWNER', approvalStatus: 'PENDING' }))).toEqual({ role: 'PET_OWNER', approvalStatus: 'PENDING' })
    expect(userWhere(userQuery.parse({}))).toEqual({})
  })
})
