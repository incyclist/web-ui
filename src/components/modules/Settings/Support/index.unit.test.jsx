import React from 'react'
import { beforeEach, describe, expect, test, vi } from 'vitest'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const { service, hasFeature, openExternal } = vi.hoisted(() => ({
    service: {
        open: vi.fn(), close: vi.fn(), getDisplayProps: vi.fn(),
        onLinkClicked: vi.fn(), onDonationClicked: vi.fn(), onEmailOpenResult: vi.fn(), onDetailsCopied: vi.fn(),
    },
    hasFeature: vi.fn(), openExternal: vi.fn(),
}))

vi.mock('incyclist-services', async (importOriginal) => ({
    ...(await importOriginal()),
    useSupportSettingsDisplay: () => service,
}))
vi.mock('../../../../utils/electron/integration', () => ({ hasFeature, api: { shell: { openExternal } } }))

import { SupportArea } from './index'

const email = {
    address: 'support@incyclist.com', subject: 's', body: 'b', copyText: 'To: support@incyclist.com',
    copyLabel: 'Copy details', copiedMessage: 'Copied. Paste it.',
}
const props = {
    appInfo: { title: 'App info', appVersion: '1.0.0', uiVersion: '2.0.0', uuid: 'u-1', privacyUrl: 'https://p',
        labels: { appVersion: 'App Version', uiVersion: 'UI Version', uuid: 'uuid', privacy: 'Privacy', privacyLink: 'Privacy Statement' },
        compactVersionText: 'Version: App 1.0.0 · UI 2.0.0', uuidActionLabel: 'Copy',
    },
    helpTitle: 'Need help?',
    helpLinks: [
        { id: 'strava', label: 'Strava Club', shortLabel: 'Strava', url: 'https://strava' },
        { id: 'email', label: 'support@incyclist.com', shortLabel: 'Email', url: 'mailto:support@incyclist.com', email },
    ],
    donation: {
        title: 'Support Incyclist', promise: 'Free.', fundsText: 'Pays for.', mode: 'direct', note: 'Voluntary.',
        channels: [
            { id: 'paypal', label: 'PayPal', subLabel: 'one-time', url: 'https://paypal', primary: true },
            { id: 'github-sponsors', label: 'GitHub Sponsors', subLabel: 'one-time or monthly', url: 'https://gh', primary: false },
        ],
        otherHelpLinks: [{ id: 'github', label: 'GitHub', url: 'https://github.com/incyclist' }],
    },
}

const writeText = vi.fn()

beforeEach(() => {
    vi.clearAllMocks()
    service.getDisplayProps.mockReturnValue(props)
    hasFeature.mockReturnValue(true)
    openExternal.mockResolvedValue(undefined)
    writeText.mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', { value: { writeText }, configurable: true })
})

describe('SupportArea', () => {
    test('renders what the display service supplies and opens/closes the display service', () => {
        const { unmount } = render(<SupportArea />)
        expect(service.open).toHaveBeenCalled()
        expect(screen.getByText('Need help?')).toBeTruthy()
        expect(screen.getByText('Support Incyclist')).toBeTruthy()
        expect(screen.getByText('PayPal')).toBeTruthy()
        unmount()
        expect(service.close).toHaveBeenCalled()
    })

    test('donation button opens the link and reports the click', async () => {
        render(<SupportArea />)
        fireEvent.click(screen.getByText('PayPal'))
        expect(service.onDonationClicked).toHaveBeenCalledWith('paypal')
        await waitFor(() => expect(openExternal).toHaveBeenCalledWith('https://paypal'))
    })

    test('other help link reports the id supplied by the display service', async () => {
        render(<SupportArea />)
        fireEvent.click(screen.getByText('GitHub'))
        expect(service.onLinkClicked).toHaveBeenCalledWith('github')
        await waitFor(() => expect(openExternal).toHaveBeenCalledWith('https://github.com/incyclist'))
    })

    test('email opens through the external path and reports success', async () => {
        render(<SupportArea />)
        fireEvent.click(screen.getByText('support@incyclist.com'))
        await waitFor(() => expect(service.onEmailOpenResult).toHaveBeenCalledWith('opened'))
        expect(openExternal).toHaveBeenCalledWith('mailto:support@incyclist.com')
        expect(writeText).not.toHaveBeenCalled()
    })

    test('failing email open falls back to the clipboard and shows the confirmation', async () => {
        openExternal.mockRejectedValue(new Error('no handler'))
        render(<SupportArea />)
        fireEvent.click(screen.getByText('support@incyclist.com'))
        await waitFor(() => expect(screen.getByText('Copied. Paste it.')).toBeTruthy())
        expect(service.onEmailOpenResult).toHaveBeenCalledWith('failed', 'no handler')
        expect(writeText).toHaveBeenCalledWith(email.copyText)
        expect(service.onDetailsCopied).toHaveBeenCalledWith('fallback', 'success')
    })

    test('Copy details button copies and confirms inline', async () => {
        render(<SupportArea />)
        fireEvent.click(screen.getByText('Copy details'))
        await waitFor(() => expect(screen.getByText('Copied. Paste it.')).toBeTruthy())
        expect(service.onDetailsCopied).toHaveBeenCalledWith('button', 'success')
    })

    test('clipboard failure is reported and shows no confirmation', async () => {
        writeText.mockRejectedValue(new Error('denied'))
        render(<SupportArea />)
        fireEvent.click(screen.getByText('Copy details'))
        await waitFor(() => expect(service.onDetailsCopied).toHaveBeenCalledWith('button', 'failed'))
        expect(screen.queryByText('Copied. Paste it.')).toBeNull()
    })

    test('website mode shows one button and no channels', async () => {
        service.getDisplayProps.mockReturnValue({
            ...props,
            donation: {
                ...props.donation, mode: 'website', fundsText: undefined, channels: [],
                websiteLink: { label: 'Ways to support Incyclist ↗', url: 'https://incyclist.com/#support', host: 'incyclist.com' },
            },
        })
        render(<SupportArea />)
        expect(screen.getByText('Ways to support Incyclist ↗')).toBeTruthy()
        expect(screen.queryByText('PayPal')).toBeNull()
        fireEvent.click(screen.getByText('incyclist.com'))
        expect(service.onDonationClicked).toHaveBeenCalledWith('website')
        await waitFor(() => expect(openExternal).toHaveBeenCalledWith('https://incyclist.com/#support'))
    })
})
