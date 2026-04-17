import { mkdir, mkdtemp, rm } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { bootstrapServer } from '../../server/bootstrapServer.js'
import { closeDatabase } from '../../server/utils/db.js'

/**
 * Boots the real Express + Socket.io stack against an isolated temp workspace
 * (SQLite file, data dirs, cwd) so integration tests do not touch dev data.
 */
export async function startTestServer() {
  const tmp = await mkdtemp(path.join(os.tmpdir(), 'connectly-vitest-'))
  const prev = {
    cwd: process.cwd(),
    env: {
      DB_PATH: process.env.DB_PATH,
      SEED_ADMIN: process.env.SEED_ADMIN,
      SEED_MODERATOR: process.env.SEED_MODERATOR,
      CONNECTLY_NO_DEMO_DATA: process.env.CONNECTLY_NO_DEMO_DATA,
      JWT_SECRET: process.env.JWT_SECRET,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    },
  }

  await mkdir(path.join(tmp, 'data', 'messages'), { recursive: true })
  await mkdir(path.join(tmp, 'data', 'uploads'), { recursive: true })
  process.chdir(tmp)
  process.env.DB_PATH = path.join(tmp, 'data', 'test.sqlite')
  process.env.SEED_ADMIN = '0'
  process.env.SEED_MODERATOR = '0'
  process.env.CONNECTLY_NO_DEMO_DATA = '1'
  process.env.JWT_SECRET = 'test_jwt_secret_connectly_vitest'
  process.env.NODE_ENV = 'test'

  const ctx = await bootstrapServer()

  async function dispose() {
    await closeDatabase()
    try {
      await ctx.io.close()
    } catch {
      /* ignore */
    }
    if (ctx.server.listening) {
      await new Promise((resolve, reject) => {
        ctx.server.close((err) => (err ? reject(err) : resolve(undefined)))
      })
    }
    process.chdir(prev.cwd)
    for (const [key, value] of Object.entries(prev.env)) {
      if (value === undefined) delete process.env[key]
      else process.env[key] = value
    }
    await rm(tmp, { recursive: true, force: true }).catch(() => {})
  }

  return { ...ctx, workspaceDir: tmp, dispose }
}
