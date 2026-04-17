import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/cn'

describe('cn (class merge)', () => {
  it('merges tailwind conflicts toward the last utility', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('keeps unrelated classes', () => {
    expect(cn('text-sm', 'font-bold')).toBe('text-sm font-bold')
  })
})
