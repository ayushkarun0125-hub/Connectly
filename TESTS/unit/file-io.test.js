import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it, afterEach } from 'vitest'
import { readJson, writeJson } from '../../server/utils/fileIO.js'

describe('fileIO readJson / writeJson', () => {
  let tmpDir

  afterEach(async () => {
    if (tmpDir) await rm(tmpDir, { recursive: true, force: true }).catch(() => {})
  })

  it('returns fallback when file is missing', async () => {
    const missing = path.join(os.tmpdir(), `missing-${Date.now()}.json`)
    const value = await readJson(missing, { ok: true })
    expect(value).toEqual({ ok: true })
  })

  it('round-trips JSON to disk', async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'connectly-fileio-'))
    const filePath = path.join(tmpDir, 'doc.json')
    await writeJson(filePath, { items: [1, 2] })
    const raw = await readJson(filePath, null)
    expect(raw).toEqual({ items: [1, 2] })
  })

  it('readJson returns fallback on invalid JSON', async () => {
    tmpDir = await mkdtemp(path.join(os.tmpdir(), 'connectly-fileio-bad-'))
    const filePath = path.join(tmpDir, 'bad.json')
    await writeFile(filePath, '{ not json', 'utf8')
    const value = await readJson(filePath, [])
    expect(value).toEqual([])
  })
})
