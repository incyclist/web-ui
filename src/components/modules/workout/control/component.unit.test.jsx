import React from 'react'
import { describe, test, expect } from 'vitest'
import { render } from '@testing-library/react'

import { WorkoutControl } from './component'

// FIXES_BACKLOG #35 / services#505: the load-adjustment buttons (+5/+1/-1/-5) either nudge
// targetPower (Watt) within the current step's power range, or scale the Workout FTP (%),
// depending on WorkoutRideService's isPowerRangeAdjustable() boundary logic - which live and
// might flip near a range's edge. This component must never re-derive that decision itself; it
// only renders whatever label `loadButtons` (from WorkoutRideService.getDashboardDisplayProperties())
// hands it, falling back to the historical static '%' labels only when the field is absent
// (e.g. idle state, or an older `services` version without this field).
describe('WorkoutControl - load button labels', () => {

    // buttons also render a (hidden-after-delay) hotkey hint in the same DOM node, e.g.
    // '+5% Shift+↑' - assert the label text is present rather than an exact match
    const getText = (container, id) => container.querySelector(`#${id}`)?.textContent

    test('falls back to static %-labels when loadButtons is not provided', () => {
        const { container } = render(<WorkoutControl />)

        expect(getText(container, 'inc5')).toContain('+5%')
        expect(getText(container, 'inc1')).toContain('+1%')
        expect(getText(container, 'dec1')).toContain('-1%')
        expect(getText(container, 'dec5')).toContain('-5%')
    })

    test('renders the %-labels services sends for a fixed-target step / FTP-scaling adjustment', () => {
        const loadButtons = { inc5: '+5%', inc1: '+1%', dec1: '-1%', dec5: '-5%' }
        const { container } = render(<WorkoutControl loadButtons={loadButtons} />)

        expect(getText(container, 'inc5')).toContain('+5%')
        expect(getText(container, 'inc1')).toContain('+1%')
        expect(getText(container, 'dec1')).toContain('-1%')
        expect(getText(container, 'dec5')).toContain('-5%')
    })

    test('renders the W-labels services sends when a range step allows nudging targetPower directly', () => {
        const loadButtons = { inc5: '+5W', inc1: '+1W', dec1: '-1W', dec5: '-5W' }
        const { container } = render(<WorkoutControl loadButtons={loadButtons} />)

        expect(getText(container, 'inc5')).toContain('+5W')
        expect(getText(container, 'inc1')).toContain('+1W')
        expect(getText(container, 'dec1')).toContain('-1W')
        expect(getText(container, 'dec5')).toContain('-5W')
    })

    test('renders a mixed set (edge-of-range: down flips to %, up stays in W)', () => {
        const loadButtons = { inc5: '+5W', inc1: '+1W', dec1: '-1%', dec5: '-5%' }
        const { container } = render(<WorkoutControl loadButtons={loadButtons} />)

        expect(getText(container, 'inc5')).toContain('+5W')
        expect(getText(container, 'inc1')).toContain('+1W')
        expect(getText(container, 'dec1')).toContain('-1%')
        expect(getText(container, 'dec5')).toContain('-5%')
    })
})
