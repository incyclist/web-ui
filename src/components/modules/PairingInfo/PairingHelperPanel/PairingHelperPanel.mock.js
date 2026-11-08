// Story data for the helper panel, in the shape the desktop pairing page service sends.

const noop = () => {}

const REASON_LABELS = {
    asleep: "It's switched off or asleep",
    other_app: "It's connected to another app or device",
    interface: "Bluetooth or ANT+ isn't working",
    no_device: "I don't have a trainer, power meter or speed sensor",
    trainer_unavailable: "My trainer isn't available today",
    unsure: 'Something else / not sure',
}

const TIPS = {
    asleep: 'Most trainers and sensors go to sleep when idle. Pedal a few strokes or press a button on the device. We keep trying automatically.',
    other_app: 'A trainer usually talks to only one app at a time. Close Zwift or other training apps, and disconnect it from your bike computer.',
    interface: "Check the connection icons at the bottom left. Grey or red means that connection isn't available. ANT+ stick not found? If you use one, plug it in, try another USB port, or close other apps that use it.",
    no_device: "To ride, Incyclist needs a smart trainer, a power meter or a speed sensor. A heart-rate monitor or cadence sensor alone isn't enough.",
    trainer_unavailable: 'To ride without your trainer, Incyclist needs a power meter or speed sensor, and none is connected. Have one? Tap the Power or Speed tile to add it.',
    unsure: "Two quick things to try: unplug your trainer's power for 10 seconds and plug it back in, and move your computer closer to it (for ANT+, a USB extension cable helps). We keep trying automatically.",
}

const browseAction = { label: 'Browse routes for now', note: "You'll need one of these devices to start a ride.", onClick: noop }

const build = ({ title, footer, ids, selected }) => {
    const helper = {
        phase: 'open',
        title,
        reasons: ids.map(id => ({ id, label: REASON_LABELS[id], selected: id === selected, onSelect: noop })),
        footer,
        onOpen: noop,
        onDismiss: noop,
    }
    if (!selected)
        return { ...helper, subline: "Pick what fits best and we'll show you what to try." }

    helper.tip = { text: TIPS[selected], shortText: TIPS[selected] }
    if (selected === 'no_device' || selected === 'trainer_unavailable')
        helper.action = browseAction
    return helper
}

/** The helper without a configured trainer, optionally with an answer picked. */
export const helperNoTrainer = (selected) => build({
    title: "Can't find your trainer?",
    footer: 'Still searching. Your tiles light up as soon as something is found.',
    ids: ['asleep', 'other_app', 'interface', 'no_device', 'unsure'],
    selected,
})

/** The helper while the configured trainer can't be reached, optionally with an answer picked. */
export const helperTrainerUnavailable = (selected) => build({
    title: "Can't connect to your trainer?",
    footer: 'Still trying to connect to your saved devices.',
    ids: ['asleep', 'other_app', 'interface', 'trainer_unavailable', 'unsure'],
    selected,
})
