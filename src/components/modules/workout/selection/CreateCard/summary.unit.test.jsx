import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

vi.mock('gd-eventlog', async (importOriginal) => ({
    ...(await importOriginal()),
    EventLogger: vi.fn(function () { return { logEvent: vi.fn() } }),
}))

import { CreateSummary } from './summary'

describe('CreateSummary', () => {

    test('renders tile view with ZwoFactory logo and triggers onOK on click and keyboard', () => {
        const onOK = vi.fn()
        render(<CreateSummary onOK={onOK} />)

        expect(screen.getByRole('heading', { name: 'Create Workout' })).toBeInTheDocument()
        expect(screen.getByAltText('ZwoFactory')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: 'Create Workout' }))
        fireEvent.keyDown(screen.getByRole('article', { name: 'Create Workout' }), { key: 'Enter' })
        expect(onOK).toHaveBeenCalledTimes(2)
    })

    test('renders list view with external editor metadata', () => {
        render(<CreateSummary layout='list' onOK={vi.fn()} />)
        expect(screen.getByText('ZwoFactory')).toBeInTheDocument()
        expect(screen.getByText('External editor')).toBeInTheDocument()
    })
})
