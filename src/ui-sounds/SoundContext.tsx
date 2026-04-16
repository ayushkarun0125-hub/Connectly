import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { primeUiAudioOnFirstGesture } from './audioEngine'

const STORAGE_KEY = 'connectly:uiSounds'

export type SoundSettingsValue = {
  enabled: boolean
  setEnabled: (next: boolean) => void
}

const SoundSettingsContext = createContext<SoundSettingsValue | null>(null)

function readInitialEnabled(): boolean {
  if (typeof window === 'undefined') return true
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === '0' || raw === 'false') return false
    return true
  } catch {
    return true
  }
}

export function SoundProvider({ children }: { children: ReactNode }) {
  const [enabled, setEnabledState] = useState(readInitialEnabled)

  useEffect(() => primeUiAudioOnFirstGesture(), [])

  const setEnabled = useCallback((next: boolean) => {
    setEnabledState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next ? '1' : '0')
    } catch {
      // ignore quota / private mode
    }
  }, [])

  const value = useMemo(() => ({ enabled, setEnabled }), [enabled, setEnabled])

  return <SoundSettingsContext.Provider value={value}>{children}</SoundSettingsContext.Provider>
}

export function useSoundSettings(): SoundSettingsValue {
  const ctx = useContext(SoundSettingsContext)
  if (!ctx) {
    throw new Error('useSoundSettings must be used within SoundProvider')
  }
  return ctx
}
