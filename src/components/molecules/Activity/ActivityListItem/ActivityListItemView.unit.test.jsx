import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ActivityListItemView } from './ActivityListItemView'

const props = {
    id: 'preview', title: 'Morning ride', dateTime: '18.10.2026 · 07:30', dateTimeISO: '2026-10-18T10:30:00Z',
    duration: '1h 5min', distance: '32.5 km', ascent: '772 m'
}

describe('ActivityListItemView', () => {
    afterEach(() => vi.clearAllMocks())

    test('renders formatted display props independently of services', () => {
        render(<ActivityListItemView {...props} uploads={[{ service: 'strava', name: 'Strava', status: 'success' }]} />)
        for (const text of ['Morning ride', '18.10.2026 · 07:30', '1h 5min', '32.5 km', '772 m', 'Strava · Uploaded']) {
            expect(screen.getByText(text)).toBeInTheDocument()
        }
        expect(screen.getByText('18.10.2026 · 07:30')).toHaveAttribute('datetime', props.dateTimeISO)
    })

    test('reports card, keyboard and Details activation while keeping Delete independent', () => {
        const onOpen = vi.fn(), onDelete = vi.fn()
        render(<ActivityListItemView {...props} onOpen={onOpen} onDelete={onDelete} />)
        const card = screen.getByRole('article', { name: 'Activity Morning ride' })
        fireEvent.click(card)
        fireEvent.keyDown(card, { key: ' ' })
        fireEvent.click(screen.getByRole('button', { name: 'View details for Morning ride' }))
        expect(onOpen.mock.calls).toEqual([['card'], ['keyboard', ' '], ['details']])
        fireEvent.keyDown(screen.getByRole('button', { name: 'Delete Morning ride' }), { key: 'Enter' })
        fireEvent.click(screen.getByRole('button', { name: 'Delete Morning ride' }))
        expect(onDelete).toHaveBeenCalledOnce()
        expect(onOpen).toHaveBeenCalledTimes(3)
    })

    test('switches between pending and unavailable power profile states', () => {
        const { rerender } = render(<ActivityListItemView {...props} loading />)
        expect(screen.getByText('Loading power profile…')).toBeInTheDocument()
        rerender(<ActivityListItemView {...props} loading={false} />)
        expect(screen.getByText('Power profile unavailable')).toBeInTheDocument()
    })
})
