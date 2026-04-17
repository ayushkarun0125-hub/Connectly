import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { ensureDmConversation, isParticipant } from '../../server/services/dmService.js'
import { startTestServer } from '../helpers/testServer.js'

describe('dmService against SQLite (integration)', () => {
  let ctx

  beforeAll(async () => {
    ctx = await startTestServer()
  })

  afterAll(async () => {
    await ctx.dispose()
  })

  it('ensureDmConversation creates a stable id and participants', async () => {
    const id = await ensureDmConversation('user_a', 'user_b')
    expect(id).toMatch(/^dm_/)
    await expect(ensureDmConversation('user_b', 'user_a')).resolves.toBe(id)
    await expect(isParticipant(id, 'user_a')).resolves.toBe(true)
    await expect(isParticipant(id, 'user_b')).resolves.toBe(true)
  })

  it('rejects DM with self', async () => {
    await expect(ensureDmConversation('same', 'same')).rejects.toThrow(/yourself/)
  })
})
