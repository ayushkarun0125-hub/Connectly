import { useCallback } from 'react'
import { useSoundSettings } from './SoundContext'
import { playClickSound, playHoverSound } from './audioEngine'

export function useUISounds() {
  const { enabled } = useSoundSettings()

  const playHover = useCallback(() => {
    if (!enabled) return
    playHoverSound()
  }, [enabled])

  const playClick = useCallback(() => {
    if (!enabled) return
    playClickSound()
  }, [enabled])

  return { playHover, playClick }
}
