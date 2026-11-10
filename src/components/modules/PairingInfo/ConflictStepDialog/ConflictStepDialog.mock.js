// Story and test data for a device-selection conflict, in the shape the desktop pairing page service
// sends - both as `pendingConflict` (a device found by the search) and as a device list's `conflictStep`.

const noop = () => {}

const row = (capability, capabilityTitle, currentName, deviceName, choice = 'keep') => ({
    capability,
    capabilityTitle,
    currentName,
    choice,
    keepLabel: `Keep ${currentName}`,
    replaceLabel: `Use ${deviceName}`,
})

/**
 * A device found by the search that wants slots already held by other devices.
 *
 * @param queued how many more conflicts wait behind this one
 * @param choice the choice the first row carries
 * @param single only the first row
 */
export const conflictFromDetection = ({ queued = 0, choice = 'keep', single = false, id = 'detection-1' } = {}) => {
    const deviceName = 'Wahoo KICKR'
    const rows = [
        row('power', 'Power', 'Assioma Duo', deviceName, choice),
        row('speed', 'Speed', 'Garmin Speed', deviceName),
    ]
    const conflict = {
        id,
        origin: 'detection',
        deviceName,
        title: `${deviceName} can also measure more`,
        subline: {
            full: `We just found your ${deviceName}. Nothing changes until you choose. Cadence was free and now uses ${deviceName}.`,
            short: `Just found ${deviceName}. Nothing changes until you choose.`,
        },
        rows: single ? rows.slice(0, 1) : rows,
        queued,
        onChoice: noop,
        onDone: noop,
        onDismiss: noop,
    }
    if (queued > 0) {
        const device = queued === 1 ? 'device' : 'devices'
        conflict.queuedText = { full: `${queued} more ${device} to check`, short: `${queued} more to check` }
    }
    return conflict
}

/** A trainer picked in the Resistance list that would take slots held by other devices. */
export const conflictFromPick = () => {
    const deviceName = 'Tacx Neo 2T'
    return {
        id: 'manual-1',
        origin: 'manual',
        deviceName,
        title: `${deviceName} can also measure more`,
        subline: {
            full: `Choose which device to use for each. Cadence was free and now uses ${deviceName}.`,
            short: 'Choose which device to use for each.',
        },
        rows: [
            row('power', 'Power', 'Assioma Duo', deviceName),
        ],
        queued: 0,
        onChoice: noop,
        onDone: noop,
        onDismiss: noop,
    }
}
