import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PairingConflictCard } from './index'
import { conflictFromDetection } from './PairingConflictCard.mock'

const conflict = (overrides = {}, options) => ({
    ...conflictFromDetection(options),
    onChoice: vi.fn(),
    onDone: vi.fn(),
    onDismiss: vi.fn(),
    ...overrides,
})

describe('PairingConflictCard', () => {

    test('renders nothing without a conflict', () => {
        const { container } = render(<PairingConflictCard />)

        expect(container.textContent).toBe('')
    })

    test('shows the title, the full subline and one row per slot in conflict', () => {
        const c = conflict()
        render(<PairingConflictCard conflict={c} />)

        expect(screen.getByRole('complementary', { name: c.title })).toBeTruthy()
        expect(screen.getByText(c.subline.full)).toBeTruthy()
        expect(screen.queryByText(c.subline.short)).toBeNull()
        expect(screen.getByText('Power')).toBeTruthy()
        expect(screen.getByText('Speed')).toBeTruthy()
        expect(screen.getAllByRole('radiogroup')).toHaveLength(2)
    })

    test('each row offers keep and replace, with keep picked by default', () => {
        render(<PairingConflictCard conflict={conflict()} />)

        const keep = screen.getByRole('radio', { name: 'Keep Assioma Duo' })
        const replace = screen.getAllByRole('radio', { name: 'Use Wahoo KICKR' })[0]
        expect(keep.getAttribute('aria-checked')).toBe('true')
        expect(replace.getAttribute('aria-checked')).toBe('false')
    })

    test('shows the choice the service hands over', () => {
        render(<PairingConflictCard conflict={conflict({}, { choice: 'replace' })} />)

        expect(screen.getByRole('radio', { name: 'Keep Assioma Duo' }).getAttribute('aria-checked')).toBe('false')
        expect(screen.getAllByRole('radio', { name: 'Use Wahoo KICKR' })[0].getAttribute('aria-checked')).toBe('true')
    })

    test('picking replace reports the row\'s capability and the choice', () => {
        const c = conflict()
        render(<PairingConflictCard conflict={c} />)

        fireEvent.click(screen.getAllByRole('radio', { name: 'Use Wahoo KICKR' })[1])

        expect(c.onChoice).toHaveBeenCalledWith('speed', 'replace')
    })

    test('the header shows how many more conflicts wait, only when there are any', () => {
        const { rerender } = render(<PairingConflictCard conflict={conflict({}, { queued: 2 })} />)
        expect(screen.getByText('2 more')).toBeTruthy()

        rerender(<PairingConflictCard conflict={conflict()} />)
        expect(screen.queryByText(/^\d+ more$/)).toBeNull()
    })

    test('Done applies the choices', () => {
        const c = conflict()
        render(<PairingConflictCard conflict={c} />)

        fireEvent.click(screen.getByRole('button', { name: 'Done' }))

        expect(c.onDone).toHaveBeenCalledTimes(1)
        expect(c.onDismiss).not.toHaveBeenCalled()
    })

    test('the close button dismisses the card', () => {
        const c = conflict()
        render(<PairingConflictCard conflict={c} />)

        fireEvent.click(screen.getByRole('button', { name: 'Close' }))

        expect(c.onDismiss).toHaveBeenCalledTimes(1)
        expect(c.onDone).not.toHaveBeenCalled()
    })
})
