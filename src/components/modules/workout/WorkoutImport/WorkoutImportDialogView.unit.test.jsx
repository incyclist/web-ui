import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { rendered } = vi.hoisted(() => ({ rendered: { dropzoneProps: null } }))

// Dropzone talks to the native file dialog and drag/drop events - neither works under jsdom.
// Stubbed to capture the props the view passes, so a test can fire onDrop directly.
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dropzone: (props) => {
            rendered.dropzoneProps = props
            return <div data-testid="workout-import-tile">{props.text}</div>
        },
    }
})

vi.mock('../../../molecules/WorkoutGraph/WorkoutGraph', () => ({
    WorkoutGraph: ({ workout, ftp }) => <div data-testid="workout-graph" data-ftp={ftp}>{workout?.name}</div>,
}))

import { WorkoutImportDialogView, WORKOUT_IMPORT_FILTERS } from './WorkoutImportDialogView'

const outside = () => document.querySelector('.dialog').parentElement
const pressEsc = () => fireEvent.keyUp(window, { key: 'Escape', keyCode: 27 })
const nextTick = () => act(() => new Promise(done => process.nextTick(done)))
const buttons = () => screen.queryAllByRole('button').map(b => b.textContent)

describe('WorkoutImportDialogView', () => {

    let handlers
    beforeEach(() => {
        vi.clearAllMocks()
        rendered.dropzoneProps = null
        handlers = { onClose: vi.fn(), onFiles: vi.fn(), onPickAnother: vi.fn(), onSetGroup: vi.fn() }
    })

    const renderView = (displayProps) => render(<WorkoutImportDialogView displayProps={displayProps} {...handlers} />)

    describe('landing', () => {
        test('shows the title, the file tile and a Cancel button', () => {
            renderView({ phase: 'landing', knownGroups: [] })
            expect(screen.getByText('Import Workout')).toBeTruthy()
            expect(screen.getByText('Choose Workout File')).toBeTruthy()
            expect(screen.getByText('ZWO or JSON')).toBeTruthy()
            expect(buttons()).toEqual(['Cancel'])
        })

        test('Cancel reports cancel', () => {
            renderView({ phase: 'landing', knownGroups: [] })
            fireEvent.click(screen.getByText('Cancel'))
            expect(handlers.onClose).toHaveBeenCalledWith('cancel')
        })

        test('tile accepts a single zwo/json file', () => {
            renderView({ phase: 'landing', knownGroups: [] })
            expect(rendered.dropzoneProps.multiple).toBe(false)
            expect(rendered.dropzoneProps.filters).toEqual(WORKOUT_IMPORT_FILTERS)
            expect(WORKOUT_IMPORT_FILTERS[0].extensions).toEqual(['zwo', 'json'])
        })

        test('dropping a file calls onFiles with the array', () => {
            renderView({ phase: 'landing', knownGroups: [] })
            const file = { type: 'url', name: 'a.zwo', ext: 'zwo' }
            act(() => { rendered.dropzoneProps.onDrop([file]) })
            expect(handlers.onFiles).toHaveBeenCalledWith([file])
        })

        test('a single (non-array) drop is wrapped, an empty one is ignored', () => {
            renderView({ phase: 'landing', knownGroups: [] })
            const file = { type: 'url', name: 'a.zwo', ext: 'zwo' }
            act(() => { rendered.dropzoneProps.onDrop(file) })
            expect(handlers.onFiles).toHaveBeenCalledWith([file])
            handlers.onFiles.mockClear()
            act(() => { rendered.dropzoneProps.onDrop([]) })
            expect(handlers.onFiles).not.toHaveBeenCalled()
        })
    })

    describe('importing', () => {
        const props = { phase: 'importing', knownGroups: [], importing: { fileName: 'ftp-test.zwo' } }

        test('shows title, loader, file name and Cancel', () => {
            renderView(props)
            expect(screen.getByText('Importing...')).toBeTruthy()
            expect(screen.getByText('Importing ftp-test.zwo…')).toBeTruthy()
            expect(document.querySelector('.dialog-content span')).toBeTruthy() // react-spinners loader
            expect(buttons()).toEqual(['Cancel'])
        })

        test('Cancel reports cancel', () => {
            renderView(props)
            fireEvent.click(screen.getByText('Cancel'))
            expect(handlers.onClose).toHaveBeenCalledWith('cancel')
        })
    })

    describe('result', () => {
        const workout = { name: 'Sweet Spot', steps: [{ type: 'step', duration: 60 }] }
        const props = {
            phase: 'result', knownGroups: ['My Workouts', 'Intervals'],
            result: { id: 'w1', workoutName: 'Sweet Spot', group: 'My Workouts', workout, ftp: 250 },
        }
        const noGraphProps = { ...props, result: { id: 'w1', workoutName: 'Sweet Spot', group: 'My Workouts' } }

        test('shows title, success header, category, graph and both buttons', () => {
            renderView(props)
            expect(screen.getByText('Import Successful')).toBeTruthy()
            expect(screen.getByText('"Sweet Spot" has been added to your library')).toBeTruthy()
            expect(screen.getByText('Category')).toBeTruthy()
            expect(screen.getByTestId('status-success')).toBeTruthy()
            expect(screen.getByTestId('workout-graph')).toBeTruthy()
            expect(buttons()).toEqual(['Import more', 'Done'])
        })

        test('graph uses the FTP from the props, 200 if missing', () => {
            renderView(props)
            expect(screen.getByTestId('workout-graph').getAttribute('data-ftp')).toBe('250')
        })

        test('graph defaults the FTP to 200', () => {
            renderView({ ...props, result: { ...props.result, ftp: undefined } })
            expect(screen.getByTestId('workout-graph').getAttribute('data-ftp')).toBe('200')
        })

        test('without workout: fallback panel without graph, still category and buttons', () => {
            renderView(noGraphProps)
            expect(screen.queryByTestId('workout-graph')).toBeNull()
            expect(screen.getByTestId('status-success')).toBeTruthy()
            expect(screen.getByText('"Sweet Spot" has been added to your library')).toBeTruthy()
            expect(screen.getByRole('combobox')).toBeTruthy()
            expect(buttons()).toEqual(['Import more', 'Done'])
        })

        test('a workout without steps uses the fallback as well', () => {
            renderView({ ...props, result: { ...props.result, workout: { name: 'x', steps: [] } } })
            expect(screen.queryByTestId('workout-graph')).toBeNull()
        })

        test('category select shows result.group', () => {
            renderView(props)
            expect(screen.getByRole('combobox').value).toBe('My Workouts')
        })

        test('category select shows a preselected group that is the last used one', () => {
            renderView({ ...props, result: { ...props.result, group: 'Intervals' } })
            expect(screen.getByRole('combobox').value).toBe('Intervals')
            expect(screen.queryByText('Please select ..')).toBeNull()
        })

        test('category select never shows the placeholder, even without a group', () => {
            renderView({ ...props, result: { ...props.result, group: undefined } })
            expect(screen.getByRole('combobox').value).toBe('My Workouts')
            expect(screen.queryByText('Please select ..')).toBeNull()
        })

        test('Done reports done', () => {
            renderView(props)
            fireEvent.click(screen.getByText('Done'))
            expect(handlers.onClose).toHaveBeenCalledWith('done')
        })

        test('Import more calls onPickAnother and does not close', () => {
            renderView(props)
            fireEvent.click(screen.getByText('Import more'))
            expect(handlers.onPickAnother).toHaveBeenCalledTimes(1)
            expect(handlers.onClose).not.toHaveBeenCalled()
        })

        test('selecting an existing group calls onSetGroup(name)', () => {
            renderView(props)
            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Intervals' } })
            expect(handlers.onSetGroup).toHaveBeenCalledWith('Intervals')
        })

        test('Add new Category shows a text field, committing it calls onSetGroup(newName)', () => {
            renderView(props)
            fireEvent.change(screen.getByRole('combobox'), { target: { value: 'Add new Category' } })
            expect(handlers.onSetGroup).not.toHaveBeenCalled()

            const input = screen.getByRole('textbox')
            fireEvent.change(input, { target: { value: 'Climbing' } })
            fireEvent.blur(input)
            expect(handlers.onSetGroup).toHaveBeenCalledWith('Climbing')
        })
    })

    describe('error', () => {
        const props = { phase: 'error', knownGroups: [], error: 'Only one workout file at a time' }

        test('shows title, reason and both buttons', () => {
            renderView(props)
            expect(screen.getByText('Import Failed')).toBeTruthy()
            expect(screen.getByText('Only one workout file at a time')).toBeTruthy()
            expect(screen.getByTestId('status-error').textContent).toBe('!')
            expect(buttons()).toEqual(['Pick another file', 'Close'])
        })

        test('Pick another file calls onPickAnother, Close reports close', () => {
            renderView(props)
            fireEvent.click(screen.getByText('Pick another file'))
            expect(handlers.onPickAnother).toHaveBeenCalledTimes(1)
            expect(handlers.onClose).not.toHaveBeenCalled()
            fireEvent.click(screen.getByText('Close'))
            expect(handlers.onClose).toHaveBeenCalledWith('close')
        })
    })

    describe.each([
        ['landing', { phase: 'landing', knownGroups: [] }],
        ['importing', { phase: 'importing', knownGroups: [], importing: { fileName: 'a.zwo' } }],
        ['result', { phase: 'result', knownGroups: [], result: { id: '1', workoutName: 'W', group: 'G' } }],
        ['error', { phase: 'error', knownGroups: [], error: 'x' }],
    ])('dismissal in phase %s', (_phase, props) => {
        test('Esc reports esc', async () => {
            renderView(props)
            pressEsc()
            await nextTick()
            expect(handlers.onClose).toHaveBeenCalledWith('esc')
        })

        test('click outside reports outside', async () => {
            renderView(props)
            fireEvent.click(outside())
            await nextTick()
            expect(handlers.onClose).toHaveBeenCalledWith('outside')
        })
    })
})
