import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { CompleteView } from './CompleteView'

describe('CompleteView', () => {

    test('shows the exact copy-deck counts', () => {
        const displayProps = {
            phase: 'complete',
            routes: [],
            completionSummary: { imported: 240, skipped: 5, errors: 2, failedRoutes: [] },
        }
        render(<CompleteView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} onClose={() => {}} />)

        expect(screen.getByText('240 routes added')).toBeInTheDocument()
        expect(screen.getByText('5 already in your library · 2 could not be imported')).toBeInTheDocument()
        expect(screen.getByText('The videos stay where they are. Keep D:\\Videos connected to ride them.')).toBeInTheDocument()
    })

    test('lets the user see which routes failed and why', () => {
        const displayProps = {
            phase: 'complete',
            routes: [],
            completionSummary: {
                imported: 1, skipped: 0, errors: 1,
                failedRoutes: [{ name: 'Broken Route', reason: "This file couldn't be read" }],
            },
        }
        render(<CompleteView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} onClose={() => {}} />)

        expect(screen.queryByText(/Broken Route/)).not.toBeInTheDocument()

        act(() => { screen.getByRole('button', { name: 'See what went wrong' }).click() })
        expect(screen.getByText("Broken Route: This file couldn't be read")).toBeInTheDocument()
    })

    test('no failed-routes link when nothing failed', () => {
        const displayProps = { phase: 'complete', routes: [], completionSummary: { imported: 10, skipped: 0, errors: 0, failedRoutes: [] } }
        render(<CompleteView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} onClose={() => {}} />)

        expect(screen.queryByRole('button', { name: 'See what went wrong' })).not.toBeInTheDocument()
    })

    test('Done calls onClose', () => {
        const onClose = vi.fn()
        const displayProps = { phase: 'complete', routes: [], completionSummary: { imported: 1, skipped: 0, errors: 0, failedRoutes: [] } }
        render(<CompleteView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} onClose={onClose} />)

        screen.getByRole('button', { name: 'Done' }).click()
        expect(onClose).toHaveBeenCalled()
    })
})
