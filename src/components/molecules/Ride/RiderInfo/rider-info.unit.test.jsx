import React from 'react'
import { describe, test, expect } from 'vitest'
import { render, screen } from '@testing-library/react'

import { RiderInfo } from './rider-info'

describe('RiderInfo power display', () => {

    test('renders normalized power (W/kg) when mpower is present', () => {
        render(<RiderInfo name="Alex" mpower={3.14} power={210} />)

        expect(screen.getByText('3.1 W/kg')).toBeDefined()
    })

    test('falls back to absolute power (W) when mpower is absent', () => {
        render(<RiderInfo name="Alex" power={210} />)

        expect(screen.getByText('210 W')).toBeDefined()
    })

    test('renders nothing for power when neither mpower nor power is present', () => {
        const { container } = render(<RiderInfo name="Alex" />)

        expect(container.textContent).not.toMatch(/W\/kg|\bW\b/)
    })
})
