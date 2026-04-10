import { mockUsers } from '../mock/data'
import { wait } from '../lib/utils'

export async function login(payload) {
  await wait(700)
  const found = mockUsers.find((user) => user.email === payload.email)
  if (!found || payload.password.length < 6) {
    throw new Error('Invalid credentials')
  }
  return { token: `mock-token-${found.id}`, user: found }
}

export async function signup(payload) {
  await wait(900)
  return {
    token: `mock-token-${Date.now()}`,
    user: { id: `u-${Date.now()}`, name: payload.name, email: payload.email, role: 'user' },
  }
}

export async function forgotPassword() {
  await wait(800)
  return { message: 'Password reset link sent.' }
}

export async function resetPassword() {
  await wait(900)
  return { message: 'Password updated successfully.' }
}
