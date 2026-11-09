// Story data for a device-selection conflict, in the shape the desktop pairing page service sends.

const noop = () => {}

const row = (capability, capabilityTitle, currentName, deviceName, choice = 'keep') => ({
    capability,
    capabilityTitle,
    currentName,
    choice,
    keepLabel: `Keep ${currentName}`,
    replaceLabel: `Use ${deviceName}`,
})

/** A device found by the search that wants slots already held by other devices. */
export const conflictFromDetection = ({ queued = 0, choice = 'keep' } = {}) => {
    const deviceName = 'Wahoo KICKR'
    const conflict = {
        id: 'detection-1',
        origin: 'detection',
        deviceName,
        title: `${deviceName} can also measure more`,
        subline: {
            full: 'Cadence was free and now uses it. Choose for the rest; nothing changes until you do.',
            short: 'Nothing changes until you choose.',
        },
        rows: [
            row('power', 'Power', 'Assioma Duo', deviceName, choice),
            row('speed', 'Speed', 'Garmin Speed', deviceName),
        ],
        queued,
        onChoice: noop,
        onDone: noop,
        onDismiss: noop,
    }
    if (queued > 0)
        conflict.queuedText = `${queued} more`
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
