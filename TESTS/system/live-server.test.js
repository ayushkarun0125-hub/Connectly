/**
 * End-to-end checks against a running server (not started by Vitest).
 *
 * Run: set RUN_SYSTEM_TESTS=1, start the API (e.g. `npm run dev` in server/),
 * optional SYSTEM_TEST_BASE_URL (default http://127.0.0.1:3001), then `npm run test:system`.
 */
import { describe, expect, it } from 'vitest'

const runLive = process.env.RUN_SYSTEM_TESTS === '1'
const baseUrl = (process.env.SYSTEM_TEST_BASE_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')

describe.skipIf(!runLive)('System: live Connectly server', () => {
  it('GET /health responds when a real server is running', async () => {
    const res = await fetch(`${baseUrl}/health`, { signal: AbortSignal.timeout(5000) })
    expect(res.ok).toBe(true)
    const body = await res.json()
    expect(body.ok).toBe(true)
    expect(body.service).toBe('connectly-server')
  })
})
