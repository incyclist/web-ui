import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EventLogger } from 'gd-eventlog'
import { useLocalLink } from 'incyclist-services'
import { RouteSharingSettingsView } from './RouteSharingSettingsView'

/**
 * "Route Sharing" tab of the Settings dialog (desktop host side). Follows the display props of the link service
 * and forwards the user's actions to it.
 */
export const RouteSharingSettings = () => {
    const service = useLocalLink()
    const logger = useRef(new EventLogger('RouteSharingSettings')).current

    const [props, setProps] = useState(() => service.getDisplayProps())
    const [removeId, setRemoveId] = useState(null)
    const [nameChanged, setNameChanged] = useState(false)

    useEffect(() => {
        const onUpdate = (updated) => setProps(updated ?? service.getDisplayProps())

        service.on('state-changed', onUpdate)
        service.on('pairing-changed', onUpdate)
        onUpdate()

        return () => {
            service.off('state-changed', onUpdate)
            service.off('pairing-changed', onUpdate)
        }
    }, [service])

    // a connect window must not outlive the tab: closing it closes pairing
    const pairingOpen = useRef(false)
    pairingOpen.current = !!props?.connectWindow
    useEffect(() => () => {
        if (pairingOpen.current)
            service.closePairing()
    }, [service])

    const connect = useCallback(() => {
        logger.logEvent({ message: 'connect window opened', eventSource: 'user' })
        service.openPairing()
    }, [service, logger])

    const setName = useCallback(async (name) => {
        const res = await service.setDisplayName(name)
        if (res?.ok)
            setNameChanged(true)
    }, [service])

    const actions = useMemo(() => ({
        connect,
        retry: () => service.setEnabled(true),
        setEnabled: (on) => {
            logger.logEvent({ message: 'route sharing switched', enabled: on, eventSource: 'user' })
            service.setEnabled(on)
        },
        setName,
        requestRemove: (id) => setRemoveId(id),
        cancelRemove: () => setRemoveId(null),
        confirmRemove: () => {
            logger.logEvent({ message: 'device removed', eventSource: 'user' })
            const id = removeId
            setRemoveId(null)
            if (id)
                service.removeClient(id)
        },
        denyPairing: () => service.denyPairing(),
        closePairing: () => service.closePairing()
    }), [service, logger, connect, setName, removeId])

    if (!props?.available)
        return null

    const removeTarget = props.devices.find(d => d.id === removeId)

    return <RouteSharingSettingsView {...props} removeTarget={removeTarget} nameChanged={nameChanged} actions={actions} />
}
