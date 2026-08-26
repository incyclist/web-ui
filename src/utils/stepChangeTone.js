/**
 * Web Audio API tone generator for the "Workout Step Change Audio Signal" feature.
 *
 * Tone spec (Garmin-matched, kept numerically identical to mobile's equivalent
 * `stepChangeAudio.ts` implementation):
 * - Countdown tick (-4s/-3s/-2s/-1s before a step ends): 2731 Hz, 100 ms, sine
 * - Step-change tone (at the transition itself): 4096 Hz, 250 ms, sine
 */

export const STEP_COUNTDOWN_TICK_TONE = { frequencyHz: 2731, durationMs: 100, waveform: 'sine' }
export const STEP_CHANGE_TONE = { frequencyHz: 4096, durationMs: 250, waveform: 'sine' }

// Module-scope AudioContext, created lazily on first playTone() call - NOT at module
// load time - so we don't trip the browser's autoplay-gesture policy. Safe here because
// by the time this ever fires, the user has already started a ride via a click/tap.
let audioContext

const getAudioContext = () => {
    if (!audioContext) {
        const Ctor = window.AudioContext || window.webkitAudioContext
        audioContext = new Ctor()
    }
    return audioContext
}

// Time (in seconds) spent ramping the gain down to 0 before oscillator.stop() - avoids
// an audible click at the end of the tone.
const RAMP_DOWN_SEC = 0.02

export const playTone = ({ frequencyHz, durationMs, waveform = 'sine' } = {}) => {
    const ctx = getAudioContext()

    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()

    oscillator.type = waveform
    oscillator.frequency.value = frequencyHz

    oscillator.connect(gain)
    gain.connect(ctx.destination)

    const now = ctx.currentTime
    const durationSec = durationMs / 1000
    const rampStart = Math.max(now, now + durationSec - RAMP_DOWN_SEC)

    gain.gain.setValueAtTime(1, now)
    gain.gain.setValueAtTime(1, rampStart)
    gain.gain.linearRampToValueAtTime(0, now + durationSec)

    oscillator.start(now)
    oscillator.stop(now + durationSec)
}
