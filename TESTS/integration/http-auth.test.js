import request from 'supertest'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { startTestServer } from '../helpers/testServer.js'

describe('HTTP auth (integration)', () => {
  let ctx

  beforeAll(async () => {
    ctx = await startTestServer()
  })

  afterAll(async () => {
    await ctx.dispose()
  })

  it('POST /api/auth/signup creates a user and token', async () => {
    const res = await request(ctx.app)
      .post('/api/auth/signup')
      .send({
        email: 'vitest-user@example.test',
        password: 'secret12',
        displayName: 'Vitest User',
      })
      .expect(201)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user?.email).toBe('vitest-user@example.test')
    expect(res.body.user?.profileCompleted).toBe(false)
  })

  it('POST /api/auth/login accepts valid credentials', async () => {
    await request(ctx.app).post('/api/auth/signup').send({
      email: 'login-user@example.test',
      password: 'secret12',
      displayName: 'Login User',
    })
    const res = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: 'login-user@example.test', password: 'secret12' })
      .expect(200)
    expect(res.body.token).toBeTruthy()
    expect(res.body.user?.email).toBe('login-user@example.test')
  })

  it('POST /api/auth/login rejects wrong password', async () => {
    await request(ctx.app).post('/api/auth/signup').send({
      email: 'bad-login@example.test',
      password: 'secret12',
      displayName: 'X',
    })
    const res = await request(ctx.app)
      .post('/api/auth/login')
      .send({ email: 'bad-login@example.test', password: 'wrongpass' })
      .expect(401)
    expect(res.body.error).toBeDefined()
  })
})
