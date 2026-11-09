import React from "react"
import { DeviceSelector } from "./component"

// Purely a renderer of the pairing page service's `deviceSelection` props - it no longer talks to
// DevicePairingService itself. Each entry in `devices` already carries its own bound
// onClick()/onDelete() from the page service. A pick is always reported without an argument: in the
// Resistance list the service fills the free slots itself and, if the pick would take slots held by
// another device, hands back `conflictStep`, which the view shows as the list's second step.
export const Wrapper = ({capability, devices, isScanning, conflictStep, onClose}) => {

    const items = devices ?? []

    // component.jsx expects a flat {name,value,connectState,interface,udid} row per device and
    // selects/deletes by `devices[i].udid` - `udid` here is just that index, so the original
    // (unmapped) `items` array can be looked back up by it.
    const mapped = items.map( (d,i) => ({ udid:i, name:d.deviceName, value:d.value, connectState:d.connectState, interface:d.interface }))

    const onSelected = (idx) => { items[idx]?.onClick?.() }
    const onDeleteClicked = (idx) => { items[idx]?.onDelete?.() }
    const onUserCancel = () => { if (onClose) onClose() }

    return <DeviceSelector
        isScanning={Boolean(isScanning)}
        capability={capability}
        devices={mapped}
        conflictStep={conflictStep}
        onOK={onSelected}
        onCancel={onUserCancel}
        onDelete={onDeleteClicked}
    />
}
