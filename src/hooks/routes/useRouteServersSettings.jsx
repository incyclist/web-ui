import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouteServersSettingsDisplay } from 'incyclist-services'

const ACTIONS = [
    'showAdd', 'showManualEntry', 'back', 'addKnown', 'retryKnown', 'setManualUrl', 'setManualName',
    'checkAndAdd', 'check', 'add', 'confirmAddEmpty', 'cancelAddEmpty', 'requestRemove', 'setRemoveRoutes', 'confirmRemove', 'cancelRemove'
]

/**
 * Connects a component to the route servers settings dialog service: opens the dialog on mount, follows its
 * `changed` events and closes it on unmount.
 *
 * `onClosed(reason, lastProps)` is called when the dialog service closes itself. `reason` is the one the dialog service
 * reports: 'done' (a server was added from the Import dialog), 'back' (Back from the first view) or 'cancel'.
 *
 * @param origin 'settings' | 'import'
 * @returns { props, actions } - props are `undefined` until the dialog is open
 */
export const useRouteServersSettings = (origin = 'settings', onClosed) => {
    const service = useRouteServersSettingsDisplay()
    const [props, setProps] = useState()
    const lastRef = useRef()
    const onClosedRef = useRef(onClosed)
    onClosedRef.current = onClosed

    useEffect(() => {
        const observer = service.open(origin)

        const onUpdate = () => {
            const updated = service.getDisplayProps()
            lastRef.current = updated
            setProps(updated)
        }
        const onPageClosed = (event) => { onClosedRef.current?.(event?.reason ?? 'cancel', lastRef.current) }

        observer?.on('changed', onUpdate)
        observer?.on('closed', onPageClosed)
        onUpdate()

        return () => {
            observer?.off?.('changed', onUpdate)
            observer?.off?.('closed', onPageClosed)
            service.close()
        }
    }, [service, origin])

    const actions = useMemo(() => {
        const res = {}
        ACTIONS.forEach(name => { res[name] = (...args) => service[name](...args) })
        return res
    }, [service])

    return { props, actions }
}
