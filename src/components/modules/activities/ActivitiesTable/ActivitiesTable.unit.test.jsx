import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { service } = vi.hoisted(() => ({ service: { getListTop: vi.fn(), setListTop: vi.fn() } }))
vi.mock('incyclist-services', async importOriginal => ({ ...await importOriginal(), useActivityList: () => service }))
vi.mock('../../../molecules/Activity', () => ({
    ActivityListItem: ({ activityInfo, outsideFold, onClick, onDelete }) => <div
        data-testid={`row-${activityInfo.summary.id}`} data-outside={String(outsideFold)}>
        <button onClick={onClick}>Open {activityInfo.summary.id}</button>
        <button onClick={onDelete}>Delete {activityInfo.summary.id}</button>
    </div>
}))

import { ActivitiesTable } from './ActivitiesTable'

const activities = Array.from({ length: 30 }, (_, i) => ({ summary: { id: `a${i}` } }))

describe('ActivitiesTable', () => {
    beforeEach(() => vi.clearAllMocks())

    test('preserves scroll position and folds rows in both directions as the list scrolls', () => {
        service.getListTop.mockReturnValue(100)
        const { container } = render(<ActivitiesTable activities={activities} />)
        const list = container.querySelector('.activities')
        expect(list.scrollTop).toBe(100)
        Object.defineProperty(list, 'scrollHeight', { configurable: true, value: 3000 })
        list.scrollTop = 0
        fireEvent.scroll(list)
        expect(screen.getByTestId('row-a0')).toHaveAttribute('data-outside', 'false')
        expect(screen.getByTestId('row-a29')).toHaveAttribute('data-outside', 'true')
        list.scrollTop = 2500
        fireEvent.scroll(list)
        expect(service.setListTop).toHaveBeenLastCalledWith(2500)
        expect(screen.getByTestId('row-a0')).toHaveAttribute('data-outside', 'true')
        expect(screen.getByTestId('row-a29')).toHaveAttribute('data-outside', 'false')
    })

    test('routes actions to the correct activity after the list changes', () => {
        const onSelect = vi.fn(), onDelete = vi.fn()
        const { rerender } = render(<ActivitiesTable activities={activities.slice(0, 3)} onSelect={onSelect} onDelete={onDelete} />)
        rerender(<ActivitiesTable activities={activities.slice(1, 3)} onSelect={onSelect} onDelete={onDelete} />)
        expect(screen.queryByTestId('row-a0')).toBeNull()
        fireEvent.click(screen.getByRole('button', { name: 'Open a1' }))
        expect(onSelect).toHaveBeenCalledWith('a1')
        fireEvent.click(screen.getByRole('button', { name: 'Delete a2' }))
        expect(onDelete).toHaveBeenCalledWith('a2')
    })
})
