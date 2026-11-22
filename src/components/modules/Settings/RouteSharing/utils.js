import { NAME_MAX_LENGTH } from './copy'

export const clipName = (value) => (value ?? '').slice(0, NAME_MAX_LENGTH)

const startOfDay = (ts) => {
    const d = new Date(ts)
    d.setHours(0, 0, 0, 0)
    return d.getTime()
}

const DAY = 24 * 60 * 60 * 1000

export const formatDay = (ts) => new Date(ts).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })

/** "Last used today|yesterday|<n> days ago|<date>" */
export const formatLastUsed = (ts, now = Date.now()) => {
    const days = Math.round((startOfDay(now) - startOfDay(ts)) / DAY)
    if (days <= 0) return 'Last used today'
    if (days === 1) return 'Last used yesterday'
    if (days < 7) return `Last used ${days} days ago`
    return `Last used ${formatDay(ts)}`
}

/** Remaining time of a code as { m, ss, seconds } */
export const getRemaining = (expiresAt, now = Date.now()) => {
    const seconds = Math.max(0, Math.ceil(((expiresAt ?? now) - now) / 1000))
    return { seconds, m: Math.floor(seconds / 60), ss: String(seconds % 60).padStart(2, '0') }
}

/** `123456` -> `123 456` */
export const groupCode = (pin) => pin ? `${pin.slice(0, 3)} ${pin.slice(3)}`.trim() : ''
