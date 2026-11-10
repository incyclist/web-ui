import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { conflictFromPick } from '../ConflictStepDialog/ConflictStepDialog.mock'

const { dialogProps } = vi.hoisted(() => ({ dialogProps: [] }))

// The Dialog molecule is stubbed only to capture the Esc / outside-click handlers it was given;
// the real children are rendered so the list and the step can be asserted on.
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dialog: (props) => {
            dialogProps.push(props)
            return <div data-testid="dialog">{props.title ? <h2>{props.title}</h2> : null}{props.children}</div>
        },
    }
})

import { DeviceSelector } from './component'

const devices = [
    { udid: 0, name: 'Tacx Neo 2T', connectState: 'connected' },
    { udid: 1, name: 'Wahoo KICKR', connectState: 'connecting' },
]

const step = (overrides = {}) => ({ ...conflictFromPick(), onChoice: vi.fn(), onDone: vi.fn(), onDismiss: vi.fn(), ...overrides })

const lastDialog = () => dialogProps[dialogProps.length - 1]

describe('DeviceSelector', () => {

    beforeEach(() => {
        dialogProps.length = 0
    })

    describe('the device list', () => {

        test('shows every device', () => {
            render(<DeviceSelector capability="control" devices={devices} />)

            expect(screen.getByText('Tacx Neo 2T')).toBeTruthy()
            expect(screen.getByText('Wahoo KICKR')).toBeTruthy()
        })

        test('has no "for all capabilities" switch, even with the deprecated props set', () => {
            render(<DeviceSelector capability="control" devices={devices} canSelectAll={true} changeForAll={false} />)

            expect(screen.queryByRole('checkbox')).toBeNull()
            expect(screen.queryByText(/for all/i)).toBeNull()
        })

        test('picking a device reports its row', async () => {
            const onOK = vi.fn()
            render(<DeviceSelector capability="control" devices={devices} onOK={onOK} />)

            fireEvent.click(screen.getByText('Wahoo KICKR'))

            await waitFor(() => expect(onOK).toHaveBeenCalledWith(1))
        })

        test('Esc and a click outside close the list', async () => {
            const onCancel = vi.fn()
            render(<DeviceSelector capability="control" devices={devices} onCancel={onCancel} />)

            lastDialog().onESC()
            lastDialog().onOutsideClicked()

            await waitFor(() => expect(onCancel).toHaveBeenCalledTimes(2))
        })
    })

    describe('the second step, after a pick that takes slots held by another device', () => {

        test('replaces the list with the step\'s title, full subline and rows', () => {
            const s = step()
            render(<DeviceSelector capability="control" devices={devices} conflictStep={s} />)

            expect(screen.getByText(s.title)).toBeTruthy()
            expect(screen.getByText(s.subline.full)).toBeTruthy()
            expect(screen.getByText('Power')).toBeTruthy()
            expect(screen.getByRole('radio', { name: 'Keep Assioma Duo' }).getAttribute('aria-checked')).toBe('true')
            expect(screen.getByRole('radio', { name: 'Use Tacx Neo 2T' }).getAttribute('aria-checked')).toBe('false')
            expect(screen.queryByText('Wahoo KICKR')).toBeNull()
        })

        test('a choice in a row is reported with the row\'s capability', () => {
            const s = step()
            render(<DeviceSelector capability="control" devices={devices} conflictStep={s} />)

            fireEvent.click(screen.getByRole('radio', { name: 'Use Tacx Neo 2T' }))

            expect(s.onChoice).toHaveBeenCalledWith('power', 'replace')
        })

        test('Done applies the choices', () => {
            const s = step()
            render(<DeviceSelector capability="control" devices={devices} conflictStep={s} />)

            fireEvent.click(screen.getByRole('button', { name: 'Done' }))

            expect(s.onDone).toHaveBeenCalledTimes(1)
        })

        test('Esc applies the choices made so far, instead of closing the list', async () => {
            const s = step()
            const onCancel = vi.fn()
            render(<DeviceSelector capability="control" devices={devices} conflictStep={s} onCancel={onCancel} />)

            lastDialog().onESC()

            await waitFor(() => expect(s.onDismiss).toHaveBeenCalledTimes(1))
            expect(onCancel).not.toHaveBeenCalled()
        })

        // the step only ever opens in direct answer to the rider's own pick, so unlike a conflict
        // found by the search it doesn't hold its buttons back for a moment
        test('answers right away: a choice and Done straight after it opens are not held back', () => {
            vi.useFakeTimers()
            try {
                const s = step()
                render(<DeviceSelector capability="control" devices={devices} conflictStep={s} />)

                fireEvent.click(screen.getByRole('radio', { name: 'Use Tacx Neo 2T' }))
                fireEvent.click(screen.getByRole('button', { name: 'Done' }))

                expect(s.onChoice).toHaveBeenCalledWith('power', 'replace')
                expect(s.onDone).toHaveBeenCalledTimes(1)
            }
            finally {
                vi.useRealTimers()
            }
        })

        test('is shown in the device list\'s own dialog, with no close button', () => {
            render(<DeviceSelector capability="control" devices={devices} conflictStep={step()} />)

            expect(lastDialog().id).toBe('DeviceSelector')
            expect(lastDialog().log).toMatchObject({ capability: 'control' })
            expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
            expect(screen.getAllByRole('button').map(b => b.textContent)).toEqual(['Done'])
        })

        test('offers no "try again"', () => {
            render(<DeviceSelector capability="control" devices={devices} conflictStep={step()} />)

            const labels = screen.getAllByRole('button').map(b => b.textContent)
            expect(labels.filter(l => /try\s*again|retry/i.test(l))).toEqual([])
        })

        test('a click outside applies the choices made so far, instead of closing the list', async () => {
            const s = step()
            const onCancel = vi.fn()
            render(<DeviceSelector capability="control" devices={devices} conflictStep={s} onCancel={onCancel} />)

            lastDialog().onOutsideClicked()

            await waitFor(() => expect(s.onDismiss).toHaveBeenCalledTimes(1))
            expect(onCancel).not.toHaveBeenCalled()
        })
    })
})
