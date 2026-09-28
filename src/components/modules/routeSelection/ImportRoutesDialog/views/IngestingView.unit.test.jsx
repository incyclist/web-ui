import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { IngestingView } from './IngestingView'

describe('IngestingView', () => {

    test('shows the current route and progress', () => {
        const displayProps = { phase: 'ingesting', routes: [], ingestProgress: { current: 3, total: 10, currentName: 'Stelvio' } }
        render(<IngestingView displayProps={displayProps} cancel={() => {}} />)

        expect(screen.getByText('Adding routes to your library')).toBeInTheDocument()
        expect(screen.getByText('Stelvio')).toBeInTheDocument()
        expect(screen.getByText('3 of 10')).toBeInTheDocument()
        expect(screen.getByText('You can keep using Incyclist — this runs in the background.')).toBeInTheDocument()
    })

    test('Stop asks for confirmation before cancelling, and backing out keeps the import running', () => {
        const cancel = vi.fn()
        const displayProps = { phase: 'ingesting', routes: [], ingestProgress: { current: 1, total: 5, currentName: 'A' } }
        render(<IngestingView displayProps={displayProps} cancel={cancel} />)

        act(() => { screen.getByRole('button', { name: 'Stop' }).click() })
        expect(screen.getByText('Stop importing?')).toBeInTheDocument()
        expect(cancel).not.toHaveBeenCalled()

        act(() => { screen.getByRole('button', { name: 'Keep going' }).click() })
        expect(cancel).not.toHaveBeenCalled()
        expect(screen.queryByText('Stop importing?')).not.toBeInTheDocument()
    })

    test('confirming Stop calls cancel', () => {
        const cancel = vi.fn()
        const displayProps = { phase: 'ingesting', routes: [], ingestProgress: { current: 1, total: 5, currentName: 'A' } }
        render(<IngestingView displayProps={displayProps} cancel={cancel} />)

        act(() => { screen.getByRole('button', { name: 'Stop' }).click() })
        act(() => { screen.getAllByRole('button', { name: 'Stop' })[1].click() })

        expect(cancel).toHaveBeenCalled()
    })
})
