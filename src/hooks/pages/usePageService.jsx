import { useCallback, useEffect, useRef, useState } from 'react'
import { useUnmountEffect } from '../flow'

/**
 * Generic, reusable counterpart of mobile's `PairingPage.tsx` pattern: opens a page service on
 * mount with `openArgs`, subscribes to its `page-update` observer event, re-reads
 * `getPageDisplayProperties()` on every update, and closes the page on unmount.
 *
 * `openArgs` is spread into `service.openPage(...openArgs)`, so each page service's own
 * signature (e.g. `openPage(forRide, source)`) is passed through unchanged.
 */
export const usePageService = (service, openArgs = []) => {

    const [props, setProps] = useState(() => service?.getPageDisplayProperties?.())
    const refObserver = useRef(null)

    const onUpdate = useCallback(() => {
        const updated = service?.getPageDisplayProperties?.()
        if (updated)
            setProps(updated)
    }, [service])

    useEffect(() => {
        if (!service || refObserver.current)
            return

        const observer = service.openPage(...openArgs)
        refObserver.current = observer
        observer?.on('page-update', onUpdate)

        onUpdate()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [service, onUpdate])

    useUnmountEffect(() => {
        service?.closePage()
        refObserver.current = null
    }, [service])

    return props
}
