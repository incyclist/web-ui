import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { service, observer, state } = vi.hoisted(() => {
    const listeners = {}
    return {
        state: { props: { phase: 'landing', knownGroups: [] } },
        observer: {
            listeners,
            on: vi.fn((evt, cb) => { (listeners[evt] ??= []).push(cb) }),
            off: vi.fn((evt, cb) => { listeners[evt] = (listeners[evt] ?? []).filter(l => l !== cb) }),
        },
        service: {
            getImportDisplayProps: vi.fn(), getPageObserver: vi.fn(), onImportFiles: vi.fn(),
            onImportOpen: vi.fn(), onImportSetGroup: vi.fn(), onImportClose: vi.fn(),
        },
    }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, getWorkoutListPageService: () => service }
})
vi.mock('../../../molecules/WorkoutGraph/WorkoutGraph', () => ({ WorkoutGraph: () => <div /> }))

import { WorkoutImportDialog } from './WorkoutImportDialog'

const emit = (props) => { state.props = props; act(() => { (observer.listeners['import-update'] ?? []).forEach(l => l()) }) }
const outside = () => document.querySelector('.dialog').parentElement
const pressEsc = () => fireEvent.keyUp(window, { key: 'Escape', keyCode: 27 })

describe('WorkoutImportDialog dismissal (real view + Dialog)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        delete window.activeDialog
        observer.listeners['import-update'] = []
        state.props = { phase: 'landing', knownGroups: [] }
        service.getImportDisplayProps.mockImplementation(() => state.props)
        service.getPageObserver.mockReturnValue(observer)
    })

    const phases = {
        landing: { phase: 'landing', knownGroups: [] },
        importing: { phase: 'importing', knownGroups: [], importing: { fileName: 'a.zwo' } },
        result: { phase: 'result', knownGroups: ['G'], result: { id: '1', workoutName: 'W', group: 'G' } },
        error: { phase: 'error', knownGroups: [], error: 'x' },
    }

    test.each(Object.keys(phases))('Esc and outside click close in phase %s', (phase) => {
        state.props = phases[phase]
        const onClose = vi.fn()
        const { unmount } = render(<WorkoutImportDialog onClose={onClose} />)
        pressEsc()
        expect(onClose).toHaveBeenCalledTimes(1)
        unmount()

        const onClose2 = vi.fn()
        render(<WorkoutImportDialog onClose={onClose2} />)
        fireEvent.click(outside())
        expect(onClose2).toHaveBeenCalledTimes(1)
    })

    test('Esc and outside click still work after phase changes and Import more', () => {
        const onClose = vi.fn()
        render(<WorkoutImportDialog onClose={onClose} />)
        emit(phases.importing)
        emit(phases.result)
        emit(phases.landing) // Import more
        emit(phases.importing)
        emit(phases.result)
        pressEsc()
        expect(onClose).toHaveBeenCalledTimes(1)
    })

    test('outside click works after phase changes', () => {
        const onClose = vi.fn()
        render(<WorkoutImportDialog onClose={onClose} />)
        emit(phases.importing)
        emit(phases.result)
        emit(phases.landing)
        fireEvent.click(outside())
        expect(onClose).toHaveBeenCalledTimes(1)
    })
})
