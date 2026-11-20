import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render } from '@testing-library/react'

const { state } = vi.hoisted(() => ({ state: { onClosed: undefined } }))

vi.mock('../../../../../hooks/routes/useRouteServersSettings', () => ({
    useRouteServersSettings: (origin, onClosed) => {
        state.onClosed = onClosed
        return { props: undefined, actions: {} }
    },
}))

import { RouteServersView } from './RouteServersView'

describe('RouteServersView', () => {
    let onBack, onClose

    beforeEach(() => {
        onBack = vi.fn()
        onClose = vi.fn()
        render(<RouteServersView onBack={onBack} onClose={onClose} />)
    })

    test("'back' returns to the landing view", () => {
        state.onClosed('back')
        expect(onBack).toHaveBeenCalledTimes(1)
        expect(onClose).not.toHaveBeenCalled()
    })

    test("'done' (manual or known server added) closes the dialog", () => {
        state.onClosed('done')
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(onBack).not.toHaveBeenCalled()
    })

    test("'cancel' just closes the dialog", () => {
        state.onClosed('cancel')
        expect(onClose).toHaveBeenCalledTimes(1)
        expect(onBack).not.toHaveBeenCalled()
    })
})
