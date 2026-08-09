import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render } from '@testing-library/react'

import { WorkoutControl } from './component'

// FIXES_BACKLOG #37: the workout dashboard's load-adjustment buttons keep %/W power semantics only
// in ERG mode (loadButtonMode==='power'). In SIM/Resistance mode they either mean gear shift
// (loadButtonMode==='gear', bare +5/+1/-1/-5 labels, no unit - matching ShiftingControl's existing
// button-text convention) or are meaningless and must be hidden entirely (loadButtonMode==='hidden'),
// while back/forward/stop/mode-toggle/pin stay visible.
describe('WorkoutControl', () => {

    const baseProps = {
        onBackward: vi.fn(), onForward: vi.fn(), onStop: vi.fn(),
        onPowerUp: vi.fn(), onPowerDown: vi.fn(),
        onPin: vi.fn(), onUnpin: vi.fn(),
        onToggleMode: vi.fn(),
        mode: 'SIM',
    }

    test('loadButtonMode="power": shows all four load buttons with the %/W labels from loadButtons', () => {
        const { container } = render(
            <WorkoutControl {...baseProps} loadButtonMode='power' loadButtons={{ inc5: '+50W', inc1: '+5W', dec1: '-1%', dec5: '-5%' }} />
        )

        expect(container.querySelector('#inc5')).toHaveTextContent('+50W')
        expect(container.querySelector('#inc1')).toHaveTextContent('+5W')
        expect(container.querySelector('#dec1')).toHaveTextContent('-1%')
        expect(container.querySelector('#dec5')).toHaveTextContent('-5%')
    })

    test('loadButtonMode="gear": shows all four load buttons with the bare gear-step labels (no unit)', () => {
        const { container } = render(
            <WorkoutControl {...baseProps} loadButtonMode='gear' loadButtons={{ inc5: '+5', inc1: '+1', dec1: '-1', dec5: '-5' }} />
        )

        expect(container.querySelector('#inc5')).toHaveTextContent('+5')
        expect(container.querySelector('#inc1')).toHaveTextContent('+1')
        expect(container.querySelector('#dec1')).toHaveTextContent('-1')
        expect(container.querySelector('#dec5')).toHaveTextContent('-5')
    })

    test('loadButtonMode="hidden": the four load buttons are not rendered at all', () => {
        const { container } = render(
            <WorkoutControl {...baseProps} loadButtonMode='hidden' loadButtons={{ inc5: '+5', inc1: '+1', dec1: '-1', dec5: '-5' }} />
        )

        expect(container.querySelector('#inc5')).toBeNull()
        expect(container.querySelector('#inc1')).toBeNull()
        expect(container.querySelector('#dec1')).toBeNull()
        expect(container.querySelector('#dec5')).toBeNull()
    })

    test('loadButtonMode="hidden": back/forward/stop/mode-toggle/pin stay visible', () => {
        const { container } = render(
            <WorkoutControl {...baseProps} loadButtonMode='hidden' />
        )

        expect(container.querySelector('#back')).not.toBeNull()
        expect(container.querySelector('#forward')).not.toBeNull()
        expect(container.querySelector('#stop')).not.toBeNull()
        expect(container.querySelector('#mode')).not.toBeNull()
        expect(container.querySelector('#pin')).not.toBeNull()
    })

    test('loadButtonMode undefined (e.g. state not loaded yet): treated as visible, falls back to default %/W labels', () => {
        const { container } = render(
            <WorkoutControl {...baseProps} />
        )

        expect(container.querySelector('#inc5')).toHaveTextContent('+5%')
        expect(container.querySelector('#inc1')).toHaveTextContent('+1%')
        expect(container.querySelector('#dec1')).toHaveTextContent('-1%')
        expect(container.querySelector('#dec5')).toHaveTextContent('-5%')
    })

    test('clicking a load button calls onPowerUp/onPowerDown regardless of mode - routing to gear-shift vs power/FTP happens in the service layer', () => {
        const onPowerUp = vi.fn()
        const onPowerDown = vi.fn()
        const { container } = render(
            <WorkoutControl {...baseProps} onPowerUp={onPowerUp} onPowerDown={onPowerDown} loadButtonMode='gear' loadButtons={{ inc5: '+5', inc1: '+1', dec1: '-1', dec5: '-5' }} />
        )

        container.querySelector('#inc5').click()
        container.querySelector('#dec1').click()

        expect(onPowerUp).toHaveBeenCalledWith(5)
        expect(onPowerDown).toHaveBeenCalledWith(1)
    })
})
