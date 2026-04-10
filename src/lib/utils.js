export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
