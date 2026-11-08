import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PairingStatusLine } from './index'

const stillSearching = { id: 'S6', dot: 'amber', text: 'Still searching…', shortText: 'Still searching', link: "Can't find your trainer?", shortLink: 'Need help?' }

describe('PairingStatusLine', () => {

    test('renders the full text', () => {
        render(<PairingStatusLine status={stillSearching} onLinkClick={vi.fn()} />)

        expect(screen.getByText('Still searching…')).toBeTruthy()
        expect(screen.queryByText('Still searching')).toBeNull()
    })

    test('renders the full link and calls the handler when it is clicked', () => {
        const onLinkClick = vi.fn()
        render(<PairingStatusLine status={stillSearching} onLinkClick={onLinkClick} />)

        fireEvent.click(screen.getByRole('button', { name: "Can't find your trainer?" }))

        expect(onLinkClick).toHaveBeenCalledTimes(1)
    })

    test('shows no link when there is nothing for it to open', () => {
        render(<PairingStatusLine status={stillSearching} />)

        expect(screen.queryByRole('button')).toBeNull()
        expect(screen.getByText('Still searching…')).toBeTruthy()
    })

    test('shows no link when the state has none', () => {
        render(<PairingStatusLine status={{ id: 'S4', dot: 'amber', text: 'Getting ready to search…' }} onLinkClick={vi.fn()} />)

        expect(screen.queryByRole('button')).toBeNull()
    })

    test('renders nothing without a status', () => {
        const { container } = render(<PairingStatusLine onLinkClick={vi.fn()} />)

        expect(container.textContent).toBe('')
    })
})
