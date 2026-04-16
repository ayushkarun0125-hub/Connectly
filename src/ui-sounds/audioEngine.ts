/** Low-level UI audio (no React). Imported by `SoundContext` and `useUISounds`. */

const HOVER_SRC = '/sounds/hover.mp3'
const CLICK_SRC = '/sounds/click.mp3'

let hoverAudio: HTMLAudioElement | null = null
let clickAudio: HTMLAudioElement | null = null
let sharedCtx: AudioContext | null = null

function getHoverAudio(): HTMLAudioElement {
  if (!hoverAudio) {
    hoverAudio = new Audio(HOVER_SRC)
    hoverAudio.preload = 'auto'
    hoverAudio.volume = 0.18
  }
  return hoverAudio
}

function getClickAudio(): HTMLAudioElement {
  if (!clickAudio) {
    clickAudio = new Audio(CLICK_SRC)
    clickAudio.preload = 'auto'
    clickAudio.volume = 0.28
  }
  return clickAudio
}

function getAudioContext(): AudioContext {
  if (!sharedCtx) {
    sharedCtx = new AudioContext({ latencyHint: 'interactive' })
  }
  return sharedCtx
}

export function resumeAudioContextSync() {
  const ctx = getAudioContext()
  void ctx.resume()
}

function playSynthHover() {
  resumeAudioContextSync()
  const ctx = getAudioContext()
  const t0 = ctx.currentTime
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(780, t0)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(0.1, t0 + 0.018)
    gain.gain.linearRampToValueAtTime(0.0001, t0 + 0.055)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.06)
  } catch {
    // ignore
  }
}

function playSynthClick() {
  resumeAudioContextSync()
  const ctx = getAudioContext()
  const t0 = ctx.currentTime
  try {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(1040, t0)
    gain.gain.setValueAtTime(0, t0)
    gain.gain.linearRampToValueAtTime(0.14, t0 + 0.015)
    gain.gain.linearRampToValueAtTime(0.0001, t0 + 0.065)
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.start(t0)
    osc.stop(t0 + 0.075)
  } catch {
    // ignore
  }
}

function playClip(el: HTMLAudioElement, synth: () => void) {
  resumeAudioContextSync()
  el.currentTime = 0
  const p = el.play()
  if (p !== undefined) {
    void p
      .then(() => {
        if (el.error) synth()
      })
      .catch(() => {
        synth()
      })
  } else {
    synth()
  }
}

export function playHoverSound() {
  playClip(getHoverAudio(), playSynthHover)
}

export function playClickSound() {
  playClip(getClickAudio(), playSynthClick)
}

/** First pointerdown anywhere resumes AudioContext so later hovers can use Web Audio. */
export function primeUiAudioOnFirstGesture() {
  if (typeof window === 'undefined') return () => {}
  const onDown = () => {
    resumeAudioContextSync()
    void getHoverAudio().load()
    void getClickAudio().load()
  }
  window.addEventListener('pointerdown', onDown, { passive: true, capture: true })
  return () => window.removeEventListener('pointerdown', onDown, { capture: true })
}
