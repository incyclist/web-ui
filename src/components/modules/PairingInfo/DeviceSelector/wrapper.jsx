import React, { useState } from "react"
import { DeviceSelector } from "./component"

// Purely a renderer of the pairing page service's `deviceSelection` props - it no longer talks to
// DevicePairingService itself. Each entry in `devices` already carries its own bound
// onClick(addAll?)/onDelete() from the page service; this wrapper only owns the "for all
// capabilities" checkbox, which is pure UI state until Wave 4.
export const Wrapper = ({capability, devices, isScanning, changeForAll:defaultChangeForAll, canSelectAll, onClose}) => {

    const [changeForAll, setChangeForAll] = useState(Boolean(defaultChangeForAll))

    const items = devices ?? []

    // component.jsx (unchanged) expects a flat {name,value,connectState,interface,udid} row per
    // device and selects/deletes by `devices[i].udid` - `udid` here is just that index, so the
    // original (unmapped) `items` array can be looked back up by it.
    const mapped = items.map( (d,i) => ({ udid:i, name:d.deviceName, value:d.value, connectState:d.connectState, interface:d.interface }))

    const onSelected = (idx) => { items[idx]?.onClick?.(changeForAll) }
    const onDeleteClicked = (idx) => { items[idx]?.onDelete?.() }
    const onUserCancel = () => { if (onClose) onClose() }
    const onAll = (checked) => { setChangeForAll(checked) }

    return <DeviceSelector
        isScanning={Boolean(isScanning)}
        capability={capability}
        canSelectAll={canSelectAll}
        changeForAll={changeForAll}
        devices={mapped}
        onOK={onSelected}
        onCancel={onUserCancel}
        onAll={onAll}
        onDelete={onDeleteClicked}
    />
}
