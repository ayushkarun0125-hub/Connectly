import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startTestServer } from '../helpers/testServer.js'

describe('HTTP health (integration)', () => {
  let ctx

  beforeAll(async () => {
    ctx = await startTestServer()
  })

  afterAll(async () => {
    await ctx.dispose()
  })

  it('GET / returns service metadata', async () => {
    const res = await request(ctx.app).get('/').expect(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.service).toBe('connectly-server')
    expect(typeof res.body.port).toBe('number')
  })

  it('GET /health includes socket summary', async () => {
    const res = await request(ctx.app).get('/health').expect(200)
    expect(res.body.ok).toBe(true)
    expect(res.body.socket).toBeDefined()
    expect(Array.isArray(res.body.socket.transports)).toBe(true)
  })
})
