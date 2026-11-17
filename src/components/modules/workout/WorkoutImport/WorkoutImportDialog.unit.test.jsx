import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { WorkoutImportDialog } from './WorkoutImportDialog'

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
            getImportDisplayProps: vi.fn(),
            getPageObserver: vi.fn(),
            onImportFiles: vi.fn(),
            onImportOpen: vi.fn(),
            onImportSetGroup: vi.fn(),
            onImportClose: vi.fn(),
        },
    }
})

vi.mock('incyclist-services', async (importOriginal) => {
    const actual = await importOriginal()
    return { ...actual, getWorkoutListPageService: () => service }
})

vi.mock('./WorkoutImportDialogView', () => ({
    WorkoutImportDialogView: ({ displayProps, onClose, onFiles, onPickAnother, onSetGroup }) => (
        <div>
            <span>phase:{displayProps.phase}</span>
            <button onClick={() => onFiles(['f'])}>files</button>
            <button onClick={onPickAnother}>another</button>
            <button onClick={() => onSetGroup('Sweet')}>group</button>
            <button onClick={() => onClose('done')}>done</button>
            <button onClick={() => onClose('esc')}>esc</button>
        </div>
    ),
}))

const emit = (evt) => act(() => { (observer.listeners[evt] ?? []).forEach(l => l()) })

describe('WorkoutImportDialog', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        observer.listeners['import-update'] = []
        state.props = { phase: 'landing', knownGroups: ['Sweet', 'VO2'] }
        service.getImportDisplayProps.mockImplementation(() => state.props)
        service.getPageObserver.mockReturnValue(observer)
    })

    test('renders the initial phase from the service', () => {
        render(<WorkoutImportDialog source='button' onClose={vi.fn()} />)
        expect(screen.getByText('phase:landing')).toBeTruthy()
    })

    test('renders the phase the service is already in (drop)', () => {
        state.props = { phase: 'importing', knownGroups: [] }
        render(<WorkoutImportDialog source='page-drop' onClose={vi.fn()} />)
        expect(screen.getByText('phase:importing')).toBeTruthy()
    })

    test('re-reads the display props on import-update', () => {
        render(<WorkoutImportDialog source='button' onClose={vi.fn()} />)
        state.props = { phase: 'result', result: { id: 'w1' }, knownGroups: ['Sweet'] }
        emit('import-update')
        expect(screen.getByText('phase:result')).toBeTruthy()
    })

    test('onFiles and onPickAnother go to the service', () => {
        render(<WorkoutImportDialog source='button' onClose={vi.fn()} />)
        fireEvent.click(screen.getByText('files'))
        expect(service.onImportFiles).toHaveBeenCalledWith(['f'], 'dialog')
        fireEvent.click(screen.getByText('another'))
        expect(service.onImportOpen).toHaveBeenCalledTimes(1)
    })

    test('onSetGroup passes the result id and the group', () => {
        state.props = { phase: 'result', result: { id: 'w1', group: 'VO2' }, knownGroups: ['Sweet', 'VO2'] }
        render(<WorkoutImportDialog source='button' onClose={vi.fn()} />)
        fireEvent.click(screen.getByText('group'))
        expect(service.onImportSetGroup).toHaveBeenCalledWith('w1', 'Sweet')
    })

    test('close ends the import, then reports onClose; unmount does not close again', () => {
        const onClose = vi.fn()
        const order = []
        service.onImportClose.mockImplementation(() => order.push('service'))
        onClose.mockImplementation(() => order.push('parent'))

        const { unmount } = render(<WorkoutImportDialog source='button' onClose={onClose} />)
        fireEvent.click(screen.getByText('done'))
        expect(order).toEqual(['service', 'parent'])

        unmount()
        expect(service.onImportClose).toHaveBeenCalledTimes(1)
    })

    test('unmount without a close action closes the import once and does not call onClose', () => {
        const onClose = vi.fn()
        const { unmount } = render(<WorkoutImportDialog source='button' onClose={onClose} />)
        unmount()
        expect(service.onImportClose).toHaveBeenCalledTimes(1)
        expect(onClose).not.toHaveBeenCalled()
    })

    test('removes the import-update listener on unmount', () => {
        const { unmount } = render(<WorkoutImportDialog source='button' onClose={vi.fn()} />)
        const cb = observer.on.mock.calls.find(c => c[0] === 'import-update')[1]
        unmount()
        expect(observer.off).toHaveBeenCalledWith('import-update', cb)
    })
})
