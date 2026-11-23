const base = {
    available: true,
    computerName: 'Home PC',
    platform: 'windows',
    routeCount: 128,
    devices: [],
    pairingOpen: false,
    listeners: { control: false, media: false },
    showUpdateFirewallNotice: false
}

const devices = [
    { id: 'a', name: 'Pixel 8', connectedAt: Date.UTC(2026, 10, 12, 12), lastSeenAt: Date.now(), active: true },
    { id: 'b', name: 'iPad Air', connectedAt: Date.UTC(2026, 9, 3, 12), lastSeenAt: Date.now() - 24 * 3600 * 1000, active: false }
]

export const neverConnected = { ...base, state: 'never-connected', computerName: 'Incyclist Computer' }
export const on = { ...base, state: 'on', devices, suffix: 'K3F9' }
export const off = { ...base, state: 'off', devices }
export const noRoutes = { ...on, routeCount: 0 }
export const startError = { ...base, state: 'error', devices, startError: { code: 'listen-failed' } }
export const oneDevice = { ...on, devices: [devices[0]] }

export const windowStarting = { phase: 'starting' }
export const windowWaiting = { phase: 'waiting' }
export const windowCode = { phase: 'code', device: 'Pixel 8', pin: '481209', expiresAt: Date.now() + 107000, attemptsLeft: 2 }
export const windowConnected = { phase: 'connected', device: 'Pixel 8' }
export const windowError = { phase: 'error' }
