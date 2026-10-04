import React, { Profiler } from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { Observer } from 'incyclist-services'
import { ImportRow } from './ImportRow'

const buildRoute = (overrides = {}) => ({
    id: 'r1',
    label: 'Alpe du Grand Serre',
    folder: 'RLV/Alps',
    format: 'rlv',
    distance: { value: 42, unit: 'km' },
    alreadyImported: false,
    parseState: 'parsed',
    importable: true,
    observer: new Observer(),
    ...overrides,
})

describe('ImportRow', () => {

    test('renders the five columns for an importable, parsed route', () => {
        const route = buildRoute()
        render(<ImportRow route={route} outsideFold={false} selected={false} onToggle={() => {}} />)

        expect(screen.getByRole('checkbox', { name: route.label })).toBeEnabled()
        expect(screen.getByText('Alpe du Grand Serre')).toBeInTheDocument()
        expect(screen.getByText('RLV/Alps')).toBeInTheDocument()
        expect(screen.getByText('RLV')).toBeInTheDocument()
        expect(screen.getByTestId('import-row-r1-distance').textContent).toBe('42km')
        // importable and not already imported - no status badge
        expect(screen.getByTestId('import-row-r1-status').textContent).toBe('')
    })

    test('a non-importable row shows a disabled checkbox and the reason in place of the distance', () => {
        const route = buildRoute({
            importable: false,
            distance: undefined,
            errorReason: "This file couldn't be read",
        })
        render(<ImportRow route={route} outsideFold={false} selected={false} onToggle={() => {}} />)

        expect(screen.getByRole('checkbox', { name: route.label })).toBeDisabled()
        expect(screen.getByTestId('import-row-r1-distance').textContent).toBe("This file couldn't be read")
        expect(screen.getByTestId('import-row-r1-status').textContent).toBe("Can't import")
    })

    test('an already-imported row is still selectable and shows the "already in library" status', () => {
        const route = buildRoute({ alreadyImported: true })
        render(<ImportRow route={route} outsideFold={false} selected={false} onToggle={() => {}} />)

        expect(screen.getByRole('checkbox', { name: route.label })).toBeEnabled()
        expect(screen.getByTestId('import-row-r1-status').textContent).toBe('Already in library')
    })

    test('a route still being parsed shows a skeleton in place of distance/status, checkbox disabled', () => {
        const route = buildRoute({ parseState: 'waiting', importable: false, distance: undefined })
        render(<ImportRow route={route} outsideFold={false} selected={false} onToggle={() => {}} />)

        expect(screen.getByRole('checkbox', { name: route.label })).toBeDisabled()
        expect(screen.getByTestId('import-row-r1-distance').textContent).toBe('')
    })

    test('outside the fold, renders a placeholder only - no checkbox, no data', () => {
        const route = buildRoute()
        render(<ImportRow route={route} outsideFold selected={false} onToggle={() => {}} />)

        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument()
        expect(screen.getByTestId('import-row-r1')).toBeInTheDocument()
    })

    test('checking the box calls onToggle', () => {
        const route = buildRoute()
        const onToggle = vi.fn()
        render(<ImportRow route={route} outsideFold={false} selected={false} onToggle={onToggle} />)

        screen.getByRole('checkbox', { name: route.label }).click()
        expect(onToggle).toHaveBeenCalled()
    })

    test('a streamed update on one route\'s own Observer re-renders only that row, not its siblings', () => {
        const routeA = buildRoute({ id: 'rA', label: 'Route A' })
        const routeB = buildRoute({ id: 'rB', label: 'Route B', distance: { value: 10, unit: 'km' } })

        const counts = {}
        const onRender = (id) => { counts[id] = (counts[id] ?? 0) + 1 }

        render(
            <>
                <Profiler id="rA" onRender={() => onRender('rA')}>
                    <ImportRow route={routeA} outsideFold={false} selected={false} onToggle={() => {}} />
                </Profiler>
                <Profiler id="rB" onRender={() => onRender('rB')}>
                    <ImportRow route={routeB} outsideFold={false} selected={false} onToggle={() => {}} />
                </Profiler>
            </>
        )

        const before = { ...counts }

        act(() => {
            routeB.observer.emit('updated', { ...routeB, distance: { value: 99, unit: 'km' } })
        })

        expect(counts.rB).toBe(before.rB + 1)
        expect(counts.rA).toBe(before.rA)
        expect(screen.getByTestId('import-row-rB-distance').textContent).toBe('99km')
        expect(screen.getByTestId('import-row-rA-distance').textContent).toBe('42km')
    })

    test('a repeat of a route earlier in the import is a duplicate, not a problem', () => {
        const route = buildRoute({
            id: 'route.xml',
            importable: false,
            errorReason: 'Duplicate of Alpe du Grand Serre',
            duplicateOf: 'Alpe du Grand Serre',
        })
        render(<ImportRow route={route} outsideFold={false} selected={false} onToggle={() => {}} />)

        expect(screen.getByTestId('import-row-route.xml-status').textContent).toBe('Duplicate')
        expect(screen.getByTestId('import-row-route.xml-distance').textContent).toBe('Duplicate of Alpe du Grand Serre')
        expect(screen.getByRole('checkbox', { name: route.label })).toBeDisabled()
    })
})
