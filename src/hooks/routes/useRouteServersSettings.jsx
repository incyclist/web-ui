import { useEffect, useMemo, useRef, useState } from 'react'
import { getRouteServersSettingsPageService } from 'incyclist-services'

const ACTIONS = [
    'showAdd', 'showManualEntry', 'back', 'addKnown', 'retryKnown', 'setManualUrl', 'setManualName',
    'checkAndAdd', 'check', 'add', 'confirmAddEmpty', 'requestRemove', 'setRemoveRoutes', 'confirmRemove', 'cancelRemove'
]

/**
 * Connects a component to the route servers settings page service: opens the page on mount, follows its
 * `page-update` events and closes it on unmount.
 *
 * `onClosed` is called with the last display props when the page service closes itself (e.g. Back from the add view
 * when it was opened from the Import dialog, or after a server was added there).
 *
 * @param origin 'settings' | 'import'
 * @returns { props, actions } - props are `undefined` until the page is open
 */
export const useRouteServersSettings = (origin = 'settings', onClosed) => {
    const service = getRouteServersSettingsPageService()
    const [props, setProps] = useState()
    const lastRef = useRef()
    const onClosedRef = useRef(onClosed)
    onClosedRef.current = onClosed

    useEffect(() => {
        const observer = service.open(origin)

        const onUpdate = () => {
            const updated = service.getPageDisplayProps()
            lastRef.current = updated
            setProps(updated)
        }
        const onPageClosed = () => { onClosedRef.current?.(lastRef.current) }

        observer?.on('page-update', onUpdate)
        observer?.on('closed', onPageClosed)
        onUpdate()

        return () => {
            observer?.off?.('page-update', onUpdate)
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
