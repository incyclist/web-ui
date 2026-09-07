import React from 'react'
import { describe, test, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import { SegmentedControl } from './component'

const options = [{ value: 0, label: 'Off' }, 1, 2, 3]

describe('SegmentedControl', () => {

    afterEach(() => { vi.clearAllMocks() })

    test('renders one option per entry, accepting objects and bare values alike', () => {
        render(<SegmentedControl label='Terrain Smoothing' options={options} value={0} />)

        expect(screen.getAllByRole('radio').map(o => o.textContent)).toEqual(['Off', '1', '2', '3'])
        expect(screen.getByRole('radiogroup', { name: 'Terrain Smoothing' })).toBeInTheDocument()
    })

    test('marks the option matching value as selected', () => {
        render(<SegmentedControl label='Terrain Smoothing' options={options} value={2} />)

        expect(screen.getByRole('radio', { name: '2' })).toBeChecked()
        expect(screen.getByRole('radio', { name: 'Off' })).not.toBeChecked()
    })

    test('reports the selected value, and stays quiet when the current one is clicked again', () => {
        const onValueChange = vi.fn()
        render(<SegmentedControl label='Terrain Smoothing' options={options} value={0} onValueChange={onValueChange} />)

        fireEvent.click(screen.getByRole('radio', { name: '3' }))
        expect(onValueChange).toHaveBeenCalledWith(3)

        fireEvent.click(screen.getByRole('radio', { name: 'Off' }))
        expect(onValueChange).toHaveBeenCalledTimes(1)
    })

    test('reports nothing while disabled', () => {
        const onValueChange = vi.fn()
        render(<SegmentedControl label='Terrain Smoothing' options={options} value={0} disabled onValueChange={onValueChange} />)

        fireEvent.click(screen.getByRole('radio', { name: '2' }))

        expect(onValueChange).not.toHaveBeenCalled()
    })

    test('renders without a label', () => {
        render(<SegmentedControl options={['A', 'B']} value='A' />)

        expect(screen.getAllByRole('radio')).toHaveLength(2)
        expect(screen.getByRole('radio', { name: 'A' })).toBeChecked()
    })
})
