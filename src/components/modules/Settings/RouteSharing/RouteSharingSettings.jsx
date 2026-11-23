import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { EventLogger } from 'gd-eventlog'
import { useLocalLink } from 'incyclist-services'
import { RouteSharingSettingsView } from './RouteSharingSettingsView'
import { logError } from './utils'

/**
 * "Route Sharing" panel of the Routes tab in the Settings dialog (desktop host side). Follows the display props of the link service
 * and forwards the user's actions to it.
 */
export const RouteSharingSettings = () => {
    const service = useLocalLink()
    const logger = useRef(new EventLogger('RouteSharingSettings')).current

    const [props, setProps] = useState(() => service.getDisplayProps())
    const [removeId, setRemoveId] = useState(null)
    const [nameChanged, setNameChanged] = useState(false)

    useEffect(() => {
        const onUpdate = (updated) => {
            try {
                setProps(updated ?? service.getDisplayProps())
            }
            catch (err) {
                logError('RouteSharingSettings', 'onUpdate', err)
            }
        }

        try {
            service.on('state-changed', onUpdate)
            service.on('pairing-changed', onUpdate)
            onUpdate()
        }
        catch (err) {
            logError('RouteSharingSettings', 'subscribe', err)
        }

        return () => {
            try {
                service.off('state-changed', onUpdate)
                service.off('pairing-changed', onUpdate)
            }
            catch (err) {
                logError('RouteSharingSettings', 'unsubscribe', err)
            }
        }
    }, [service])

    // a connect window must not outlive the panel: closing it closes pairing
    const pairingOpen = useRef(false)
    pairingOpen.current = !!props?.connectWindow
    useEffect(() => () => {
        try {
            if (pairingOpen.current)
                service.closePairing()
        }
        catch (err) {
            logError('RouteSharingSettings', 'closePairingOnUnmount', err)
        }
    }, [service])

    const connect = useCallback(() => {
        try {
            logger.logEvent({ message: 'connect window opened', eventSource: 'user' })
            service.openPairing()
        }
        catch (err) {
            logError('RouteSharingSettings', 'connect', err)
        }
    }, [service, logger])

    const setName = useCallback(async (name) => {
        try {
            const res = await service.setDisplayName(name)
            if (res?.ok)
                setNameChanged(true)
        }
        catch (err) {
            logError('RouteSharingSettings', 'setName', err)
        }
    }, [service])

    const actions = useMemo(() => ({
        connect,
        retry: () => {
            try {
                service.setEnabled(true)
            }
            catch (err) {
                logError('RouteSharingSettings', 'retry', err)
            }
        },
        setEnabled: (on) => {
            try {
                logger.logEvent({ message: 'route sharing switched', enabled: on, eventSource: 'user' })
                service.setEnabled(on)
            }
            catch (err) {
                logError('RouteSharingSettings', 'setEnabled', err)
            }
        },
        setName,
        requestRemove: (id) => {
            try {
                setRemoveId(id)
            }
            catch (err) {
                logError('RouteSharingSettings', 'requestRemove', err)
            }
        },
        cancelRemove: () => {
            try {
                setRemoveId(null)
            }
            catch (err) {
                logError('RouteSharingSettings', 'cancelRemove', err)
            }
        },
        confirmRemove: () => {
            try {
                logger.logEvent({ message: 'device removed', eventSource: 'user' })
                const id = removeId
                setRemoveId(null)
                if (id)
                    service.removeClient(id)
            }
            catch (err) {
                logError('RouteSharingSettings', 'confirmRemove', err)
            }
        },
        denyPairing: () => {
            try {
                service.denyPairing()
            }
            catch (err) {
                logError('RouteSharingSettings', 'denyPairing', err)
            }
        },
        closePairing: () => {
            try {
                service.closePairing()
            }
            catch (err) {
                logError('RouteSharingSettings', 'closePairing', err)
            }
        }
    }), [service, logger, connect, setName, removeId])

    if (!props?.available)
        return null

    const removeTarget = props.devices.find(d => d.id === removeId)

    return <RouteSharingSettingsView {...props} removeTarget={removeTarget} nameChanged={nameChanged} actions={actions} />
}
