import { EventLogger } from 'gd-eventlog'
import { NAME_MAX_LENGTH } from './copy'

const logger = new EventLogger('RouteSharing')

/** Logs a swallowed error: component, function name and message only. Must itself never throw. */
export const logError = (source, fn, err) => {
    try {
        logger.logEvent({ message: 'error', source, fn, error: err?.message ?? String(err) })
    }
    catch { /* nothing left to do */ }
}

export const clipName = (value) => {
    try {
        return (value ?? '').slice(0, NAME_MAX_LENGTH)
    }
    catch (err) {
        logError('utils', 'clipName', err)
        return ''
    }
}

const startOfDay = (ts) => {
    try {
        const d = new Date(ts)
        d.setHours(0, 0, 0, 0)
        return d.getTime()
    }
    catch (err) {
        logError('utils', 'startOfDay', err)
        return 0
    }
}

const DAY = 24 * 60 * 60 * 1000

export const formatDay = (ts) => {
    try {
        return new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    }
    catch (err) {
        logError('utils', 'formatDay', err)
        return ''
    }
}

/** "Last used today|yesterday|<n> days ago|<date>" */
export const formatLastUsed = (ts, now = Date.now()) => {
    try {
        const days = Math.round((startOfDay(now) - startOfDay(ts)) / DAY)
        if (days <= 0) return 'Last used today'
        if (days === 1) return 'Last used yesterday'
        if (days < 7) return `Last used ${days} days ago`
        return `Last used ${formatDay(ts)}`
    }
    catch (err) {
        logError('utils', 'formatLastUsed', err)
        return ''
    }
}

/** Remaining time of a code as { m, ss, seconds } */
export const getRemaining = (expiresAt, now = Date.now()) => {
    try {
        const seconds = Math.max(0, Math.ceil(((expiresAt ?? now) - now) / 1000))
        return { seconds, m: Math.floor(seconds / 60), ss: String(seconds % 60).padStart(2, '0') }
    }
    catch (err) {
        logError('utils', 'getRemaining', err)
        return { seconds: 0, m: 0, ss: '00' }
    }
}

/** `123456` -> `123 456` */
export const groupCode = (pin) => {
    try {
        return pin ? `${pin.slice(0, 3)} ${pin.slice(3)}`.trim() : ''
    }
    catch (err) {
        logError('utils', 'groupCode', err)
        return ''
    }
}
