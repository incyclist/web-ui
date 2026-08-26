import { describe, test, expect, vi, beforeEach } from 'vitest'

describe('stepChangeTone', () => {

    let created
    let oscillators
    let gains

    beforeEach(() => {
        vi.resetModules()
        created = { oscillators: 0, gains: 0, audioContexts: 0 }
        oscillators = []
        gains = []

        class FakeGainParam {
            constructor() { this.values = [] }
            setValueAtTime(value, time) { this.values.push({ type: 'set', value, time }) }
            linearRampToValueAtTime(value, time) { this.values.push({ type: 'ramp', value, time }) }
        }

        class FakeOscillator {
            constructor() {
                this.type = undefined
                this.frequency = { value: undefined }
                this.connected = undefined
                this.started = undefined
                this.stopped = undefined
                oscillators.push(this)
                created.oscillators++
            }
            connect(node) { this.connected = node }
            start(time) { this.started = time }
            stop(time) { this.stopped = time }
        }

        class FakeGain {
            constructor() {
                this.gain = new FakeGainParam()
                this.connectedTo = undefined
                gains.push(this)
                created.gains++
            }
            connect(node) { this.connectedTo = node }
        }

        class FakeAudioContext {
            constructor() {
                this.currentTime = 10
                this.destination = { id: 'destination' }
                created.audioContexts++
            }
            createOscillator() { return new FakeOscillator() }
            createGain() { return new FakeGain() }
        }

        window.AudioContext = FakeAudioContext
        delete window.webkitAudioContext
    })

    test('STEP_COUNTDOWN_TICK_TONE matches the Garmin spec (2731 Hz, 100 ms, sine)', async () => {
        const { STEP_COUNTDOWN_TICK_TONE } = await import('./stepChangeTone')
        expect(STEP_COUNTDOWN_TICK_TONE).toEqual({ frequencyHz: 2731, durationMs: 100, waveform: 'sine' })
    })

    test('STEP_CHANGE_TONE matches the Garmin spec (4096 Hz, 250 ms, sine)', async () => {
        const { STEP_CHANGE_TONE } = await import('./stepChangeTone')
        expect(STEP_CHANGE_TONE).toEqual({ frequencyHz: 4096, durationMs: 250, waveform: 'sine' })
    })

    test('playTone(STEP_COUNTDOWN_TICK_TONE) configures an oscillator with the exact frequency/type and stops it after 100ms', async () => {
        const { playTone, STEP_COUNTDOWN_TICK_TONE } = await import('./stepChangeTone')

        playTone(STEP_COUNTDOWN_TICK_TONE)

        expect(oscillators).toHaveLength(1)
        const osc = oscillators[0]
        expect(osc.type).toBe('sine')
        expect(osc.frequency.value).toBe(2731)
        expect(osc.started).toBe(10)
        expect(osc.stopped).toBe(10.1)
    })

    test('playTone(STEP_CHANGE_TONE) configures an oscillator with the exact frequency/type and stops it after 250ms', async () => {
        const { playTone, STEP_CHANGE_TONE } = await import('./stepChangeTone')

        playTone(STEP_CHANGE_TONE)

        expect(oscillators).toHaveLength(1)
        const osc = oscillators[0]
        expect(osc.type).toBe('sine')
        expect(osc.frequency.value).toBe(4096)
        expect(osc.started).toBe(10)
        expect(osc.stopped).toBe(10.25)
    })

    test('ramps the gain down to 0 before the oscillator stops, to avoid an audible click', async () => {
        const { playTone, STEP_CHANGE_TONE } = await import('./stepChangeTone')

        playTone(STEP_CHANGE_TONE)

        expect(gains).toHaveLength(1)
        const gain = gains[0]
        const rampEvents = gain.gain.values.filter(v => v.type === 'ramp')
        expect(rampEvents).toHaveLength(1)
        expect(rampEvents[0].value).toBe(0)
        expect(rampEvents[0].time).toBeCloseTo(10.25, 5)

        // oscillator must be routed through the gain node, and the gain node to the destination
        const osc = oscillators[0]
        expect(osc.connected).toBe(gain)
    })

    test('connects the gain node to the AudioContext destination', async () => {
        const { playTone, STEP_CHANGE_TONE } = await import('./stepChangeTone')

        playTone(STEP_CHANGE_TONE)

        const gain = gains[0]
        expect(gain.connectedTo).toEqual({ id: 'destination' })
    })

    test('reuses a single module-scope AudioContext across multiple calls', async () => {
        const { playTone, STEP_CHANGE_TONE, STEP_COUNTDOWN_TICK_TONE } = await import('./stepChangeTone')

        playTone(STEP_CHANGE_TONE)
        playTone(STEP_COUNTDOWN_TICK_TONE)

        expect(created.audioContexts).toBe(1)
        expect(oscillators).toHaveLength(2)
    })

    test('does not create the AudioContext at module load time (only lazily, on first call)', async () => {
        await import('./stepChangeTone')

        expect(created.audioContexts).toBe(0)
    })
})
