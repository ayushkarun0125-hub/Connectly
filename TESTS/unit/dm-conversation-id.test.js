import { describe, expect, it } from 'vitest'
import { buildDmConversationId } from '../../server/services/dmService.js'

describe('buildDmConversationId', () => {
  it('is stable regardless of argument order', () => {
    const a = 'user_aaa'
    const b = 'user_bbb'
    expect(buildDmConversationId(a, b)).toBe(buildDmConversationId(b, a))
  })

  it('includes both user ids in the id', () => {
    const id = buildDmConversationId('user_x', 'user_y')
    expect(id).toContain('user_x')
    expect(id).toContain('user_y')
    expect(id.startsWith('dm_')).toBe(true)
  })
})
