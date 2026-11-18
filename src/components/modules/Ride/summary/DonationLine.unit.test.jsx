import React from 'react'
import { describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen } from '@testing-library/react'

vi.mock('../../../../utils/electron/integration', () => ({
    hasFeature: () => false, api: {},
}))

import { DonationLine } from './ActivitySummary'

const donation = {
    text: 'Incyclist is free.', shortText: 'Free.', hideLabel: 'Hide',
    links: [
        { id: 'paypal', label: 'PayPal', url: 'https://paypal' },
        { id: 'github-sponsors', label: 'GitHub Sponsors', url: 'https://gh' },
    ],
}

describe('DonationLine', () => {
    test('renders text, channel links and Hide', () => {
        render(<DonationLine donation={donation} />)
        expect(screen.getByText(/Incyclist is free\./)).toBeTruthy()
        expect(screen.getByText('PayPal')).toBeTruthy()
        expect(screen.getByText('GitHub Sponsors')).toBeTruthy()
        expect(screen.getByText('Hide')).toBeTruthy()
    })

    test('link click reports the channel', () => {
        const onDonateClicked = vi.fn()
        render(<DonationLine donation={donation} onDonateClicked={onDonateClicked} />)
        fireEvent.click(screen.getByText('GitHub Sponsors'))
        expect(onDonateClicked).toHaveBeenCalledWith('github-sponsors')
    })

    test('Hide calls the handler', () => {
        const onDonateHidden = vi.fn()
        render(<DonationLine donation={donation} onDonateHidden={onDonateHidden} />)
        fireEvent.click(screen.getByText('Hide'))
        expect(onDonateHidden).toHaveBeenCalledTimes(1)
    })
})
