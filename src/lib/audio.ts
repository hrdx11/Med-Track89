// Web Audio API & Web Speech Synthesizer for MediTrack

let audioCtx: AudioContext | null = null

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    audioCtx = new AudioContextClass()
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume()
  }
  return audioCtx
}

/**
 * Play a peaceful, soothing zen chime for dose reminders
 */
export function playZenChime() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // E major pentatonic chord: E4, G#4, B4, E5
    const freqs = [329.63, 415.30, 493.88, 659.25]

    freqs.forEach((freq, index) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + index * 0.08)

      gain.gain.setValueAtTime(0.001, now + index * 0.08)
      gain.gain.exponentialRampToValueAtTime(0.25 / (index + 1), now + index * 0.08 + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.08 + 2.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + index * 0.08)
      osc.stop(now + index * 0.08 + 2.3)
    })
  } catch (e) {
    console.warn('Audio playback error:', e)
  }
}

/**
 * Play a gentle wooden marimba chime
 */
export function playMarimba() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const freqs = [523.25, 659.25, 783.99, 1046.50] // C5, E5, G5, C6

    freqs.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(freq, now + i * 0.06)

      gain.gain.setValueAtTime(0.3, now + i * 0.06)
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.6)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + i * 0.06)
      osc.stop(now + i * 0.06 + 0.65)
    })
  } catch (e) {
    console.warn('Audio playback error:', e)
  }
}

/**
 * Play a crystal bell tone
 */
export function playCrystalBell() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(880, now) // A5
    osc.frequency.exponentialRampToValueAtTime(1760, now + 0.1)

    gain.gain.setValueAtTime(0.001, now)
    gain.gain.exponentialRampToValueAtTime(0.3, now + 0.02)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.8)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 1.9)
  } catch (e) {
    console.warn('Audio playback error:', e)
  }
}

/**
 * Play a success affirmative sound when dose is taken
 */
export function playSuccessChime() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const freqs = [440, 554.37, 659.25, 880] // A4, C#5, E5, A5

    freqs.forEach((freq, idx) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.type = 'sine'
      osc.frequency.setValueAtTime(freq, now + idx * 0.05)

      gain.gain.setValueAtTime(0.001, now + idx * 0.05)
      gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.05 + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.5)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + idx * 0.05)
      osc.stop(now + idx * 0.05 + 0.55)
    })
  } catch (e) {
    console.warn('Audio playback error:', e)
  }
}

/**
 * Play intense Emergency SOS Siren Beeps
 */
export function playEmergencySiren(durationSeconds: number = 3) {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sawtooth'
    
    // Siren wobble between 650Hz and 950Hz
    for (let t = 0; t < durationSeconds; t += 0.5) {
      osc.frequency.setValueAtTime(650, now + t)
      osc.frequency.linearRampToValueAtTime(950, now + t + 0.25)
      osc.frequency.linearRampToValueAtTime(650, now + t + 0.5)
    }

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.linearRampToValueAtTime(0.2, now + durationSeconds - 0.1)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSeconds)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + durationSeconds)
  } catch (e) {
    console.warn('Audio playback error:', e)
  }
}

/**
 * Play a single countdown tick beep
 */
export function playCountdownTick() {
  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(800, now)

    gain.gain.setValueAtTime(0.2, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.16)
  } catch (e) {
    console.warn('Audio playback error:', e)
  }
}

export function playReminderSound(theme: 'zen_chime' | 'marimba' | 'crystal_bell' | 'gentle_pulse' = 'zen_chime') {
  switch (theme) {
    case 'marimba':
      playMarimba()
      break
    case 'crystal_bell':
      playCrystalBell()
      break
    case 'gentle_pulse':
    case 'zen_chime':
    default:
      playZenChime()
      break
  }
}

/**
 * Spoken Voice Announcement using Web Speech API
 */
export function speakReminderText(text: string) {
  if (!('speechSynthesis' in window)) return
  try {
    window.speechSynthesis.cancel() // Stop any previous speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95 // slightly slower for clarity (elderly-friendly)
    utterance.pitch = 1.0
    utterance.volume = 0.9
    window.speechSynthesis.speak(utterance)
  } catch (e) {
    console.warn('Speech synthesis error:', e)
  }
}
