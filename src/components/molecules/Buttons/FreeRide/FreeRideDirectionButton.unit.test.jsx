import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { logEvent } = vi.hoisted(() => ({ logEvent: vi.fn() }))
vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { this.logEvent = logEvent })
}))

import { FreeRideDirectionButton, FreeRideDialogButton } from './FreeRideDirectionButton'

describe('start dialog buttons', () => {
    beforeEach(() => { logEvent.mockClear() })

    const option = { id: 'a', color: '#e5484d', text: 'North', compass: 'North', heading: 0, roadLabel: 'Calle del Padre Damián' }

    test('a click on a direction is logged and forwarded, without the road name', () => {
        const onClick = vi.fn()
        render(<FreeRideDirectionButton option={option} onClick={onClick} />)

        fireEvent.click(screen.getByRole('button'))

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledWith({ message: 'button clicked', button: 'North', eventSource: 'user' })
        expect(JSON.stringify(logEvent.mock.calls)).not.toContain('Padre')
    })

    test('Cancel is logged and forwarded', () => {
        const onClick = vi.fn()
        render(<FreeRideDialogButton text='Cancel' onClick={onClick} />)

        fireEvent.click(screen.getByText('Cancel'))

        expect(onClick).toHaveBeenCalledTimes(1)
        expect(logEvent).toHaveBeenCalledWith({ message: 'button clicked', button: 'Cancel', eventSource: 'user' })
    })
})
