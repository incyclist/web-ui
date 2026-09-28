import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { RouteListToolbar, SEARCH_TIMEOUT } from './index'

const SORT_OPTIONS = [
    { value:'suggested', label:'Suggested' },
    { value:'name',      label:'Name (A–Z)' },
]

describe('RouteListToolbar', () => {

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    test('always shows the search box with its placeholder', () => {
        render(<RouteListToolbar sortOptions={SORT_OPTIONS} />)
        expect(screen.getByPlaceholderText('Search routes by name')).toBeInTheDocument()
    })

    test('title search is debounced by 500ms', () => {
        const onTitleChange = vi.fn()
        render(<RouteListToolbar onTitleChange={onTitleChange} sortOptions={SORT_OPTIONS} />)

        const input = screen.getByPlaceholderText('Search routes by name')
        fireEvent.change(input, {target:{value:'Al'}})
        fireEvent.change(input, {target:{value:'Alpe'}})

        act(() => { vi.advanceTimersByTime(SEARCH_TIMEOUT-1) })
        expect(onTitleChange).not.toHaveBeenCalled()

        act(() => { vi.advanceTimersByTime(1) })
        expect(onTitleChange).toHaveBeenCalledTimes(1)
        expect(onTitleChange).toHaveBeenCalledWith('Alpe')
    })

    test('Enter commits immediately, Esc clears', () => {
        const onTitleChange = vi.fn()
        render(<RouteListToolbar onTitleChange={onTitleChange} sortOptions={SORT_OPTIONS} />)

        const input = screen.getByPlaceholderText('Search routes by name')
        fireEvent.change(input, {target:{value:'Alpe'}})
        fireEvent.keyDown(input, {key:'Enter'})
        expect(onTitleChange).toHaveBeenLastCalledWith('Alpe')

        fireEvent.keyDown(input, {key:'Escape'})
        expect(onTitleChange).toHaveBeenLastCalledWith(undefined)
        expect(input.value).toBe('')

        // the pending debounce must not re-apply the old text
        act(() => { vi.advanceTimersByTime(SEARCH_TIMEOUT) })
        expect(onTitleChange).toHaveBeenCalledTimes(2)
    })

    test('an external title change is shown in the search box', () => {
        const { rerender } = render(<RouteListToolbar title='Alpe' sortOptions={SORT_OPTIONS} />)
        expect(screen.getByPlaceholderText('Search routes by name').value).toBe('Alpe')

        rerender(<RouteListToolbar title={undefined} sortOptions={SORT_OPTIONS} />)
        expect(screen.getByPlaceholderText('Search routes by name').value).toBe('')
    })

    test('Filters disclosure shows the number of active filters and toggles', () => {
        const onToggleFilters = vi.fn()
        const chips = [{key:'contentType',label:'Video'},{key:'country',label:'France'}]
        const { container } = render(<RouteListToolbar chips={chips} onToggleFilters={onToggleFilters} sortOptions={SORT_OPTIONS} />)

        const toggle = container.querySelector('.filters-toggle')
        expect(toggle).toHaveTextContent('Filters')
        expect(toggle.getAttribute('aria-expanded')).toBe('false')
        expect(container.querySelector('.filters-count')).toHaveTextContent('2')

        fireEvent.click(toggle)
        expect(onToggleFilters).toHaveBeenCalledTimes(1)
    })

    test('no count badge without active filters', () => {
        const { container } = render(<RouteListToolbar chips={[]} filtersExpanded sortOptions={SORT_OPTIONS} />)
        expect(container.querySelector('.filters-count')).toBeNull()
        expect(container.querySelector('.filters-toggle').getAttribute('aria-expanded')).toBe('true')
        expect(screen.queryByText('Clear all')).toBeNull()
    })

    test('active filters are removable chips, with Clear all', () => {
        const onRemoveFilter = vi.fn()
        const onClearFilters = vi.fn()
        const chips = [{key:'contentType',label:'Video'},{key:'country',label:'France'}]
        const { container } = render(<RouteListToolbar chips={chips} onRemoveFilter={onRemoveFilter} onClearFilters={onClearFilters} sortOptions={SORT_OPTIONS} />)

        const rendered = container.querySelectorAll('.filter-chip')
        expect(rendered).toHaveLength(2)
        expect(rendered[0]).toHaveTextContent('Video')
        expect(rendered[1]).toHaveTextContent('France')

        fireEvent.click(rendered[1].querySelector('.filter-chip-remove'))
        expect(onRemoveFilter).toHaveBeenCalledWith('country')

        fireEvent.click(screen.getByText('Clear all'))
        expect(onClearFilters).toHaveBeenCalledTimes(1)
    })

    test('shows the result count', () => {
        render(<RouteListToolbar countText='38 of 1 247 routes' sortOptions={SORT_OPTIONS} />)
        expect(screen.getByText('38 of 1 247 routes')).toBeInTheDocument()
    })

    test('sort control shows the current order and reports changes', () => {
        const onSortOrderChange = vi.fn()
        const { container } = render(<RouteListToolbar sortOrder='suggested' sortOptions={SORT_OPTIONS} onSortOrderChange={onSortOrderChange} />)

        expect(screen.getByText('Sort:')).toBeInTheDocument()
        const select = container.querySelector('.sort-order')
        expect(select.value).toBe('suggested')

        fireEvent.change(select, {target:{value:'name'}})
        expect(onSortOrderChange).toHaveBeenCalledWith('name')
    })

    test('the List/Tile display-type toggle is the last item, grouped with Sort', () => {
        const onDisplayTypeSelected = vi.fn()
        const { container } = render(<RouteListToolbar sortOptions={SORT_OPTIONS} displayType='list' onDisplayTypeSelected={onDisplayTypeSelected} />)

        const group = container.querySelector('.route-list-sort-display')
        expect(group).not.toBeNull()
        expect(group.querySelector('.sort-order')).not.toBeNull()
        expect(group.querySelector('#tiles')).not.toBeNull()

        fireEvent.click(group.querySelector('#tiles'))
        expect(onDisplayTypeSelected).toHaveBeenCalledWith('tiles')
    })
})
