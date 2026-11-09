/**
 * What the status line's link does. On desktop every link asks for help: the helper covers waking
 * the trainer, other apps holding it, and the Bluetooth/ANT+ connection icons (there's no single
 * interface a "Check connections" link could open its settings for).
 *
 * @param status the status line's display props
 * @param helper the helper's display props; only set while the page is open
 * @returns the handler, or `undefined` if the line has no link or there's nothing it could open
 */
export const getStatusLinkHandler = (status, helper) => {
    if (!status?.link)
        return undefined
    return helper?.onOpen
}

/** The helper panel is on screen: open, or showing that it resolved. */
export const isHelperShown = (helper) => helper !== undefined && helper !== null && helper.phase !== 'hidden'
