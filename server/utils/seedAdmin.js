/* global process */
import crypto from 'node:crypto'
import bcrypt from 'bcryptjs'
import { getDb } from './db.js'

/**
 * Ensures a default admin exists for local / course demos.
 * Skipped when SEED_ADMIN=0.
 * In production, runs only when SEED_ADMIN=1 (not recommended for public deploys).
 */
export async function seedDefaultAdmin() {
  if (process.env.SEED_ADMIN === '0') return

  const isProd = process.env.NODE_ENV === 'production'
  if (isProd && process.env.SEED_ADMIN !== '1') return

  const email = String(process.env.ADMIN_EMAIL || 'admin@connectly.local').trim().toLowerCase()
  const password = process.env.ADMIN_PASSWORD || 'ConnectlyAdmin2026!'

  if (!email) {
    console.warn('[seed] ADMIN_EMAIL empty; skipping admin seed')
    return
  }
  if (password.length < 6) {
    console.warn('[seed] ADMIN_PASSWORD must be at least 6 characters; skipping admin seed')
    return
  }

  const db = getDb()
  const existing = await db.get('SELECT id FROM users WHERE email = ?', email)
  if (existing) return

  const id = `user_admin_${crypto.randomBytes(8).toString('hex')}`
  const hash = await bcrypt.hash(password, 10)
  const now = new Date().toISOString()

  await db.run(
    `INSERT INTO users (id, email, password_hash, display_name, role, created_at, bio, profile_completed) VALUES (?, ?, ?, ?, ?, ?, NULL, 1)`,
    id,
    email,
    hash,
    'Admin',
    'admin',
    now,
  )

  console.log(
    `[seed] Default admin created: ${email} (display: Admin, role: admin). Password: set via ADMIN_PASSWORD or default in server/.env.example — change it for anything beyond local use.`,
  )
}
