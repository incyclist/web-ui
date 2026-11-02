import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { FreeRideOptionBand, getChipText } from './FreeRideOptionBand'

const opt = (id, props = {}) => ({ id, color: 'red', direction: 0, maneuver: 'straight', maneuverText: 'Straight', roadLabel: `Road ${id}`, selected: false, ...props })
const two = [opt('a', { maneuverText: 'Left', direction: -80, maneuver: 'left' }), opt('b', { selected: true, selectedBy: 'auto' })]

describe('getChipText', () => {
    test('junction with a choice', () => {
        expect(getChipText({ options: two, optionsState: 'ready', distance: '70m' })).toBe('Junction in 70m')
    })
    test('a single way on is not framed as a choice', () => {
        expect(getChipText({ options: [opt('a')], optionsState: 'ready', distance: '70m' })).toBe('Next road in 70m')
    })
    test('hidden: the chip says what will happen', () => {
        expect(getChipText({ options: two, optionsState: 'ready', distance: '70m', hidden: true })).toBe('Junction in 70m · AUTO Straight')
        const chosen = [two[0], { ...two[1], selected: false }].map((o, i) => i === 0 ? { ...o, selected: true, selectedBy: 'user' } : o)
        expect(getChipText({ options: chosen, optionsState: 'ready', distance: '70m', hidden: true })).toBe('Junction in 70m · ✓ NEXT Left')
    })
    test('loading and failed', () => {
        expect(getChipText({ options: [], optionsState: 'loading' })).toBe('Finding the roads ahead…')
        expect(getChipText({ options: [], optionsState: 'loading', distance: '20m' })).toBe('Junction in 20m · loading roads…')
        expect(getChipText({ options: [], optionsState: 'failed' })).toBe("Couldn't load the roads here")
    })
    test('nothing to say without options', () => {
        expect(getChipText({ options: [], optionsState: 'none', distance: '70m' })).toBeUndefined()
    })
})

describe('FreeRideOptionBand', () => {
    test('renders one tile per option, in the given order', () => {
        render(<FreeRideOptionBand options={two} optionsState='ready' distance='70m' />)
        const tiles = screen.getAllByRole('radio')
        expect(tiles).toHaveLength(2)
        expect(tiles[0].textContent).toContain('Left')
    })

    test('selecting a tile reports id, index and source', () => {
        const onOptionSelected = vi.fn()
        render(<FreeRideOptionBand options={two} optionsState='ready' distance='70m' onOptionSelected={onOptionSelected} />)

        fireEvent.click(screen.getAllByRole('radio')[0])
        expect(onOptionSelected).toHaveBeenCalledWith('a', 0, 'click')
    })

    test('hidden: no tiles that could take clicks, the chip stays', () => {
        render(<FreeRideOptionBand options={two} optionsState='ready' distance='70m' hidden />)
        expect(screen.queryAllByRole('radio')).toHaveLength(0)
        expect(screen.getByText(/AUTO Straight/)).toBeTruthy()
    })

    test('loading shows no placeholder tiles', () => {
        render(<FreeRideOptionBand options={[]} optionsState='loading' />)
        expect(screen.queryAllByRole('radio')).toHaveLength(0)
        expect(screen.getByText('Finding the roads ahead…')).toBeTruthy()
    })

    test('renders nothing without options and without a message', () => {
        const { container } = render(<FreeRideOptionBand options={[]} optionsState='none' />)
        expect(container.firstChild).toBeNull()
    })

    test('six options stay in one band', () => {
        const six = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) => opt(id))
        render(<FreeRideOptionBand options={six} optionsState='ready' distance='70m' />)
        expect(screen.getAllByRole('radio')).toHaveLength(6)
    })
})
