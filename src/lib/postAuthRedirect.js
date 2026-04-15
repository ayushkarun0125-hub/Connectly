/**
 * Where to send the user after sign-in or profile completion.
 * Admins and moderators only use their portals (not the main workspace shell).
 */
export function postAuthDestination(user) {
  if (!user) return '/app'
  if (user.profileCompleted === false) return '/setup-profile'
  if (user.role === 'admin') return '/app/admin'
  if (user.role === 'moderator') return '/app/moderator'
  return '/app'
}
