import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

const { routeList, fold } = vi.hoisted(() => ({
    routeList: { getListTop: vi.fn(() => 0), setListTop: vi.fn() },
    fold: { swipedRecently: vi.fn(() => false) }
}))

vi.mock('incyclist-services', async importOriginal => ({
    ...await importOriginal(), useRouteList: () => routeList
}))
vi.mock('../../hooks', async importOriginal => ({
    ...await importOriginal(),
    useFoldWindow: () => ({
        ref: null, observer: {}, isOutsideFold: () => false,
        getFoldEvent: id => id, swipedRecently: fold.swipedRecently
    })
}))
vi.mock('../../components/atoms', async importOriginal => ({
    ...await importOriginal(), Dynamic: ({ children }) => children
}))
vi.mock('../../components/modules/routeSelection/base/Card', () => ({
    Card: ({ id, visible, onOK, onDelete }) => <div data-testid={`tile-${id}`} data-visible={String(visible)}>
        <button onClick={onOK}>Open {id}</button><button onClick={onDelete}>Delete {id}</button>
    </div>
}))

import { RouteTiles } from './RouteTiles'

const cards = ['route-1', 'route-2'].map(id => ({
    id, isVisible: () => true, setInitialized: vi.fn(),
    getDisplayProperties: () => ({ title: id, visible: true })
}))

describe('RouteTiles', () => {
    beforeEach(() => vi.clearAllMocks())

    test('renders route cards from the combined list and keeps its scroll position', () => {
        render(<RouteTiles cards={cards} />)
        expect(screen.getByTestId('tile-route-1')).toHaveAttribute('data-visible', 'true')
        expect(screen.getByTestId('tile-route-2')).toBeInTheDocument()
        expect(routeList.getListTop).toHaveBeenCalledWith('tiles')
    })

    test('opens and deletes the selected route by id', () => {
        const onSelect = vi.fn(), onDelete = vi.fn()
        render(<RouteTiles cards={cards} onSelect={onSelect} onDelete={onDelete} />)

        fireEvent.click(screen.getByRole('button', { name: 'Open route-2' }))
        fireEvent.click(screen.getByRole('button', { name: 'Delete route-1' }))
        expect(onSelect).toHaveBeenCalledWith('route-2')
        expect(onDelete).toHaveBeenCalledWith('route-1')
    })
})
