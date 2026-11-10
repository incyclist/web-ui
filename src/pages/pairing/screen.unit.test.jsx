import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { PairingScreen } from './screen'
import { conflictFromDetection } from '../../components/modules/PairingInfo/ConflictStepDialog/ConflictStepDialog.mock'

const tile = (overrides = {}) => ({
    title: 'Resistance',
    capability: 'control',
    role: 'required',
    helpText: { full: 'help', short: 'help' },
    emptyFooter: 'Searching...',
    ...overrides,
})

const helper = (overrides = {}) => ({
    phase: 'open',
    title: "Can't find your trainer?",
    reasons: [{ id: 'asleep', label: "It's switched off or asleep", selected: false, onSelect: vi.fn() }],
    footer: 'Still searching. Your tiles light up as soon as something is found.',
    onOpen: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
})

// the tile element: the title's container
const tileOf = (title) => screen.getByText(title).parentElement

describe('PairingScreen', () => {

    test('renders a tile with no device as a SearchingDevice, waiting when required and not ready', () => {
        render(<PairingScreen capabilities={{ top: [tile()], bottom: [] }} readyToStart={false} />)

        expect(screen.getByText('Resistance')).toBeTruthy()
        expect(screen.getByText('Searching...')).toBeTruthy()
    })

    test('renders a tile with a device as a SelectedDevice', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Neo', connectState: 'connected' })], bottom: [] }} />)

        expect(screen.getByText('Tacx Neo')).toBeTruthy()
    })

    test('clicking a tile calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [tile({ onClick })], bottom: [] }} />)

        fireEvent.click(screen.getByText('Resistance'))

        expect(onClick).toHaveBeenCalled()
    })

    test('a selected tile\'s onUnselect/onUse come straight from its own props, not from the page', () => {
        const onUnselect = vi.fn()
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Neo', connectState:'connected', onUnselect })], bottom: [] }} />)

        fireEvent.click(screen.getByRole('switch'))

        expect(onUnselect).toHaveBeenCalled()
    })

    test('renders the row labels from capabilities.rowLabels', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [], rowLabels: { top: { text: 'TO RIDE', subtext: 'connect any one' }, bottom: { text: 'OPTIONAL' } } }} />)

        expect(screen.getByText('TO RIDE')).toBeTruthy()
        expect(screen.getByText('connect any one')).toBeTruthy()
        expect(screen.getByText('OPTIONAL')).toBeTruthy()
    })

    describe('row labels and the helper panel', () => {

        const rowLabels = { top: { text: 'TO RIDE', subtext: 'connect any one' }, bottom: { text: 'OPTIONAL', subtext: 'add what you have' } }

        test('while the helper is closed, the label sits in a column left of the tiles', () => {
            const { container } = render(<PairingScreen capabilities={{ top: [tile()], bottom: [], rowLabels }} helper={helper({ phase: 'hidden' })} />)

            const label = getComputedStyle(screen.getByText('TO RIDE').parentElement)
            expect(label.width).toBe('10vw')
            expect(label.flexDirection).toBe('column')
            expect(getComputedStyle(container.querySelector('.top')).paddingLeft).not.toBe('1vw')
        })

        test('while the helper is open, the label is one line above the tiles and the row gives up the label column', () => {
            const { container } = render(<PairingScreen capabilities={{ top: [tile()], bottom: [], rowLabels }} helper={helper()} />)

            for (const [row, text] of [['.top', 'TO RIDE'], ['.bottom', 'OPTIONAL']]) {
                const label = getComputedStyle(screen.getByText(text).parentElement)
                expect(label.position).toBe('absolute')
                expect(label.left).toBe('1vw')
                expect(label.flexDirection).toBe('row')
                expect(label.whiteSpace).toBe('nowrap')
                expect(label.width).not.toBe('10vw')
                expect(getComputedStyle(container.querySelector(row)).paddingLeft).toBe('1vw')
            }
        })

        test('while the helper is open, the bold label is never cut; only the sub-label may take the ellipsis', () => {
            render(<PairingScreen capabilities={{ top: [tile()], bottom: [], rowLabels }} helper={helper()} />)

            const text = screen.getByText('TO RIDE')
            const sub = screen.getByText('connect any one')
            expect(text.textContent).toBe('TO RIDE')
            expect(text.parentElement).toBe(sub.parentElement)

            const textStyle = getComputedStyle(text)
            expect(textStyle.fontWeight).toBe('bold')
            expect(textStyle.flexShrink).toBe('0')
            expect(textStyle.overflow).not.toBe('hidden')

            const subStyle = getComputedStyle(sub)
            expect(subStyle.fontWeight).not.toBe('bold')
            expect(subStyle.overflow).toBe('hidden')
            expect(subStyle.textOverflow).toBe('ellipsis')
            expect(subStyle.minWidth).toMatch(/^0(px)?$/)
        })

        test('a row with no sub-label shows just its bold label above the tiles', () => {
            render(<PairingScreen capabilities={{ top: [], bottom: [], rowLabels: { top: { text: 'TO RIDE' }, bottom: { text: 'OPTIONAL' } } }} helper={helper()} />)

            expect(screen.getByText('OPTIONAL').parentElement.children.length).toBe(1)
        })
    })

    test('renders the status line from the status prop, not derived locally', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} status={{ id: 'S3', dot: 'amber', text: 'Connect a trainer' }} />)

        expect(screen.getByText('Connect a trainer')).toBeTruthy()
    })

    test('renders no status line when the service sends none', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} />)

        expect(screen.queryByText('Connect a trainer')).toBeNull()
    })

    test('renders each button from the buttons prop and wires its own onClick', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} buttons={[{ label: 'Simulate', primary: true, onClick }, { label: 'Skip', primary: false, onClick: vi.fn() }]} />)

        fireEvent.click(screen.getByText('Simulate'))

        expect(onClick).toHaveBeenCalled()
        expect(screen.getByText('Skip')).toBeTruthy()
    })

    test('the status line\'s link opens the helper', () => {
        const onOpen = vi.fn()
        const status = { id: 'S6', dot: 'amber', text: 'Still searching…', link: "Can't find your trainer?" }
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} status={status} helper={helper({ phase: 'hidden', onOpen })} />)

        fireEvent.click(screen.getByRole('button', { name: "Can't find your trainer?" }))

        expect(onOpen).toHaveBeenCalledTimes(1)
    })

    test('shows no helper panel while the helper is hidden', () => {
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} helper={helper({ phase: 'hidden' })} />)

        expect(screen.queryByText("Can't find your trainer?")).toBeNull()
    })

    test('shows the helper panel beside the tiles while it is open', () => {
        render(<PairingScreen capabilities={{ top: [tile()], bottom: [] }} helper={helper()} />)

        expect(screen.getByRole('complementary', { name: "Can't find your trainer?" })).toBeTruthy()
        expect(screen.getByText('Resistance')).toBeTruthy()
    })

    test('a tile the page waits for gets the amber frame, others don\'t', () => {
        render(<PairingScreen capabilities={{ top: [tile({ awaited: true }), tile({ title: 'Power', capability: 'power', awaited: false })], bottom: [] }} />)

        expect(tileOf('Resistance').querySelector('[data-testid="awaited-frame"]')).toBeTruthy()
        expect(tileOf('Power').querySelector('[data-testid="awaited-frame"]')).toBeFalsy()
    })

    test('a tile with a device the page waits for gets the amber frame too', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Flux', connectState: 'connecting', awaited: true })], bottom: [] }} />)

        expect(tileOf('Resistance').querySelector('[data-testid="awaited-frame"]')).toBeTruthy()
    })

    test('the frame follows the awaited prop, not the role', () => {
        render(<PairingScreen capabilities={{ top: [tile({ awaited: false })], bottom: [] }} readyToStart={false} />)

        expect(tileOf('Resistance').querySelector('[data-testid="awaited-frame"]')).toBeFalsy()
    })

    test('the amber frame is the tile\'s last child, so it paints above the footer strip', () => {
        render(<PairingScreen capabilities={{ top: [tile({ awaited: true })], bottom: [] }} />)

        const container = tileOf('Resistance')
        expect(container.lastElementChild.getAttribute('data-testid')).toBe('awaited-frame')
    })

    test('an empty tile shows the service\'s footer copy instead of its empty footer', () => {
        render(<PairingScreen capabilities={{ top: [tile({ title: 'Power', capability: 'power', emptyFooter: 'Searching...', footerText: { full: 'Optional for now', short: 'Optional for now' } })], bottom: [] }} />)

        expect(screen.getByText('Optional for now')).toBeTruthy()
        expect(screen.queryByText('Searching...')).toBeNull()
    })

    test('the trainer\'s tile shows its role line above the device name and the full footer copy as written', () => {
        render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Flux', connectState: 'failed', trainerRole: 'trainer', roleLabel: 'Your trainer', footerText: { full: 'Not connected · waiting', short: 'Waiting…' }, awaited: true })], bottom: [] }} />)

        const role = screen.getByText('Your trainer')
        const device = screen.getByText('Tacx Flux')
        expect(role.compareDocumentPosition(device) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByText('Not connected · waiting')).toBeTruthy()
        expect(screen.queryByText('Waiting…')).toBeNull()
        expect(screen.queryByText('failed')).toBeNull()
    })

    test('a tile the trainer fills shows its role line below the device name', () => {
        render(<PairingScreen capabilities={{ top: [tile({ title: 'Power', capability: 'power', deviceName: 'Tacx Flux', connectState: 'failed', trainerRole: 'via-trainer', roleLabel: 'via your trainer', footerText: { full: 'Waiting for trainer', short: 'Via trainer' } })], bottom: [] }} />)

        const role = screen.getByText('via your trainer')
        const device = screen.getByText('Tacx Flux')
        expect(device.compareDocumentPosition(role) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
        expect(screen.getByText('Waiting for trainer')).toBeTruthy()
    })

    test('an empty tile\'s footer stays on one line and may only be cut with an ellipsis', () => {
        render(<PairingScreen capabilities={{ top: [tile({ footerText: { full: 'Waiting for trainer', short: 'Waiting' } })], bottom: [] }} />)

        const footer = getComputedStyle(screen.getByText('Waiting for trainer'))
        expect(footer.whiteSpace).toBe('nowrap')
        expect(footer.overflow).toBe('hidden')
        expect(footer.textOverflow).toBe('ellipsis')
        expect(footer.minWidth).toMatch(/^0(px)?$/)
    })

    describe('a tile dimmed while the ride falls back to another device', () => {

        const dimmedTrainer = (overrides = {}) => tile({
            deviceName: 'Tacx Flux', connectState: 'failed', trainerRole: 'trainer', roleLabel: 'Your trainer',
            footerText: { full: 'Tap to use again', short: 'Tap to use again' }, dimmed: true, awaited: false, ...overrides,
        })

        test('the Resistance tile shows no toggle, and its role line and footer copy as given', () => {
            render(<PairingScreen capabilities={{ top: [dimmedTrainer()], bottom: [] }} />)

            expect(screen.queryByRole('switch')).toBeNull()
            expect(screen.getByText('Your trainer')).toBeTruthy()
            expect(screen.getByText('Tap to use again')).toBeTruthy()
        })

        test('a click on the dimmed Resistance tile calls the tile\'s own onClick', () => {
            const onClick = vi.fn()
            render(<PairingScreen capabilities={{ top: [dimmedTrainer({ onClick })], bottom: [] }} />)

            fireEvent.click(tileOf('Resistance'))

            expect(onClick).toHaveBeenCalledTimes(1)
        })

        test('another tile the trainer still fills is dimmed the same way, while the fallback device\'s tile keeps its toggle', () => {
            const speed = tile({ title: 'Speed', capability: 'speed', deviceName: 'Tacx Flux', connectState: 'failed', dimmed: true, footerText: { full: 'Not used', short: 'Not used' } })
            const power = tile({ title: 'Power', capability: 'power', deviceName: 'Assioma Duo', connectState: 'connected', onUnselect: vi.fn() })
            render(<PairingScreen capabilities={{ top: [dimmedTrainer(), power, speed], bottom: [] }} />)

            expect(screen.getAllByRole('switch')).toHaveLength(1)
            expect(tileOf('Power').querySelector('[role="switch"]')).toBeTruthy()
            expect(screen.getByText('Not used')).toBeTruthy()
        })
    })

    describe('switching Resistance off', () => {

        // whether that opens the helper or unselects the trainer is the page service's decision
        test.each(['connecting', 'failed', 'connected'])('calls the tile\'s onUnselect once while the trainer is %s', (connectState) => {
            const onUnselect = vi.fn()
            const onClick = vi.fn()
            render(<PairingScreen capabilities={{ top: [tile({ deviceName: 'Tacx Flux', connectState, onUnselect, onClick })], bottom: [] }} />)

            fireEvent.click(screen.getByRole('switch'))

            expect(onUnselect).toHaveBeenCalledTimes(1)
            expect(onClick).not.toHaveBeenCalled()
        })
    })

    describe('a conflict found by the search', () => {

        const conflict = (options, overrides = {}) => ({ ...conflictFromDetection(options), onChoice: vi.fn(), onDone: vi.fn(), onDismiss: vi.fn(), ...overrides })
        const nextTick = () => act(() => new Promise(done => process.nextTick(done)))

        afterEach(() => {
            vi.useRealTimers()
        })

        test('is shown as a dialog whenever the service hands it over, with its title, full subline, rows and queued count', () => {
            const c = conflict({ queued: 1 })
            render(<PairingScreen capabilities={{ top: [tile()], bottom: [] }} pendingConflict={c} buttons={[{ label: 'OK', primary: true, onClick: vi.fn() }]} />)

            expect(screen.getByRole('dialog', { name: c.title })).toBeTruthy()
            expect(screen.getByText(c.subline.full)).toBeTruthy()
            expect(screen.queryByText(c.subline.short)).toBeNull()
            expect(screen.getAllByRole('radiogroup')).toHaveLength(2)
            expect(screen.getByText('1 more')).toBeTruthy()
            expect(screen.getByText('Resistance')).toBeTruthy()
        })

        test('is not shown without one', () => {
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} />)

            expect(screen.queryByRole('dialog')).toBeNull()
            expect(document.querySelector('.dialog')).toBeNull()
        })

        test('never goes into the panel beside the tiles, and the tiles keep their full layout', () => {
            const rowLabels = { top: { text: 'TO RIDE' }, bottom: { text: 'OPTIONAL' } }
            const { container } = render(<PairingScreen capabilities={{ top: [tile()], bottom: [], rowLabels }} helper={helper({ phase: 'hidden' })} pendingConflict={conflict()} />)

            expect(screen.queryByRole('complementary')).toBeNull()
            expect(getComputedStyle(container.querySelector('.top')).paddingLeft).not.toBe('1vw')
            expect(getComputedStyle(screen.getByText('TO RIDE').parentElement).flexDirection).toBe('column')
        })

        test('the panel beside the tiles only follows the helper', () => {
            const c = conflict()
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} helper={helper()} pendingConflict={c} />)

            expect(screen.getAllByRole('complementary')).toHaveLength(1)
            expect(screen.getByRole('complementary', { name: "Can't find your trainer?" })).toBeTruthy()
        })

        test('covers the whole page, so a click where OK sits lands outside the dialog instead of on OK', () => {
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} pendingConflict={conflict()} buttons={[{ label: 'OK', primary: true, onClick: vi.fn() }]} />)

            const layer = getComputedStyle(document.querySelector('.dialog').parentElement)
            expect(layer.position).toBe('fixed')
            expect([layer.top, layer.bottom, layer.left, layer.right]).toEqual(['0px', '0px', '0px', '0px'])
            expect(Number(layer.zIndex)).toBeGreaterThan(0)
        })

        test('has no close button', () => {
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} pendingConflict={conflict()} />)

            expect(screen.queryByRole('button', { name: 'Close' })).toBeNull()
            expect(screen.queryByText('✕')).toBeNull()
        })

        test('Keep, Use and Done ignore clicks for a moment after the dialog appears, then call the conflict\'s own handlers', () => {
            vi.useFakeTimers()
            const c = conflict()
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} pendingConflict={c} />)

            fireEvent.click(screen.getAllByRole('radio', { name: 'Use Wahoo KICKR' })[0])
            fireEvent.click(screen.getByRole('button', { name: 'Done' }))
            expect(c.onChoice).not.toHaveBeenCalled()
            expect(c.onDone).not.toHaveBeenCalled()

            act(() => { vi.advanceTimersByTime(500) })

            fireEvent.click(screen.getAllByRole('radio', { name: 'Use Wahoo KICKR' })[0])
            fireEvent.click(screen.getByRole('button', { name: 'Done' }))
            expect(c.onChoice).toHaveBeenCalledWith('power', 'replace')
            expect(c.onDone).toHaveBeenCalledTimes(1)
            expect(c.onDismiss).not.toHaveBeenCalled()
        })

        test('Esc calls the conflict\'s onDismiss right away, even while the buttons are still held back', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const c = conflict()
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} pendingConflict={c} />)

            fireEvent.keyUp(window, { key: 'Escape', keyCode: 27 })
            await nextTick()

            expect(c.onDismiss).toHaveBeenCalledTimes(1)
            expect(c.onDone).not.toHaveBeenCalled()
        })

        test('a click outside calls the conflict\'s onDismiss right away, even while the buttons are still held back', async () => {
            vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
            const c = conflict()
            render(<PairingScreen capabilities={{ top: [], bottom: [] }} pendingConflict={c} />)

            fireEvent.click(document.querySelector('.dialog').parentElement)
            await nextTick()

            expect(c.onDismiss).toHaveBeenCalledTimes(1)
            expect(c.onDone).not.toHaveBeenCalled()
        })
    })

    describe('no "try again" anywhere on the screen', () => {

        const retryWording = /try\s*again|retry|re-?try|reconnect/i

        const fallbackAction = { label: 'Ride with power meter only', onClick: vi.fn() }
        const states = {
            'searching': {
                capabilities: { top: [tile({ awaited: true })], bottom: [] },
                buttons: [{ label: 'Stop searching', primary: true, onClick: vi.fn() }, { label: 'Skip', primary: false, onClick: vi.fn() }],
            },
            'trainer unreachable, helper open with the fallback action': {
                capabilities: { top: [tile({ deviceName: 'Tacx Flux', connectState: 'failed', trainerRole: 'trainer', roleLabel: 'Your trainer', footerText: { full: 'Not connected · waiting', short: 'Waiting…' }, onUnselect: vi.fn() })], bottom: [] },
                helper: helper({ reasons: [{ id: 'trainer_unavailable', label: "My trainer isn't available today", selected: true, onSelect: vi.fn() }], tip: { text: 'Ride with your power meter.', shortText: '' }, action: fallbackAction }),
                buttons: [{ label: 'Skip', primary: true, onClick: vi.fn() }],
            },
            'fallback active': {
                capabilities: { top: [tile({ deviceName: 'Tacx Flux', connectState: 'failed', dimmed: true, roleLabel: 'Your trainer', footerText: { full: 'Tap to use again', short: 'Tap to use again' } }), tile({ title: 'Power', capability: 'power', deviceName: 'Assioma Duo', connectState: 'connected', onUnselect: vi.fn() })], bottom: [] },
                buttons: [{ label: 'OK', primary: true, onClick: vi.fn() }],
            },
            'search ended without a trainer': {
                capabilities: { top: [tile({ emptyFooter: 'Not found' })], bottom: [] },
                buttons: [{ label: 'Search again', primary: true, onClick: vi.fn() }, { label: 'Skip', primary: false, onClick: vi.fn() }],
            },
            'conflict dialog shown': {
                capabilities: { top: [], bottom: [] },
                pendingConflict: { ...conflictFromDetection({ queued: 1 }) },
                buttons: [{ label: 'OK', primary: true, onClick: vi.fn() }, { label: 'Search again', primary: false, onClick: vi.fn() }],
            },
        }

        test.each(Object.keys(states))('while %s', (name) => {
            render(<PairingScreen {...states[name]} />)

            const labels = screen.getAllByRole('button').map(b => b.textContent)
            expect(labels.length).toBeGreaterThan(0)
            expect(labels.filter(l => retryWording.test(l))).toEqual([])
        })
    })

    test('clicking an interface calls its own bound onClick, not a page-level handler', () => {
        const onClick = vi.fn()
        render(<PairingScreen capabilities={{ top: [], bottom: [] }} interfaces={[{ name: 'ant', enabled: true, state: 'idle', onClick }]} />)

        fireEvent.click(screen.getByText('Ant+'))

        expect(onClick).toHaveBeenCalled()
    })
})
