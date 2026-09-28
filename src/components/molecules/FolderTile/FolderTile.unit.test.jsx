import React from 'react'
import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { mockSelectDirectory, logEvent } = vi.hoisted(() => ({
    mockSelectDirectory: vi.fn(),
    logEvent: vi.fn(),
}))

vi.mock('../../../bindings/native-ui', () => ({
    useAppUI: () => ({ selectDirectory: mockSelectDirectory }),
}))

vi.mock('gd-eventlog', () => ({
    EventLogger: class { logEvent(...args) { logEvent(...args) } },
}))

import { FolderTile } from './index'

describe('FolderTile', () => {

    beforeEach(() => {
        vi.clearAllMocks()
    })

    const click = async () => {
        await act(async () => { fireEvent.click(screen.getByRole('button')) })
    }

    test('shows its text and children', () => {
        render(<FolderTile text="Pick a folder"><span>more</span></FolderTile>)

        expect(screen.getByText('Pick a folder')).toBeTruthy()
        expect(screen.getByText('more')).toBeTruthy()
    })

    test('a click opens the folder picker and hands over the chosen folder', async () => {
        mockSelectDirectory.mockResolvedValue({ canceled: false, selected: 'file:///mnt/nas/routes', displayName: 'routes' })
        const onSelect = vi.fn()
        render(<FolderTile id="tile" text="Pick" onSelect={onSelect} />)

        await click()

        expect(onSelect).toHaveBeenCalledWith({ uri: 'file:///mnt/nas/routes', displayName: 'routes' })
    })

    test('logs the click like the Dropzone does, and the selection', async () => {
        mockSelectDirectory.mockResolvedValue({ canceled: false, selected: 'file:///mnt/nas/routes', displayName: 'routes' })
        render(<FolderTile id="tile" text="Pick" onSelect={vi.fn()} />)

        await click()

        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'dropzone clicked', dropZone: 'tile', eventSource: 'user' }))
        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'dropzone folder selected', folder: 'routes' }))
    })

    test('cancelling the picker does not call onSelect', async () => {
        mockSelectDirectory.mockResolvedValue({ canceled: true })
        const onSelect = vi.fn()
        render(<FolderTile text="Pick" onSelect={onSelect} />)

        await click()

        expect(onSelect).not.toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'button clicked', button: 'cancel' }))
    })

    test('a failing picker is logged and does not throw', async () => {
        mockSelectDirectory.mockRejectedValue(new Error('boom'))
        const onSelect = vi.fn()
        render(<FolderTile text="Pick" onSelect={onSelect} />)

        await click()

        expect(onSelect).not.toHaveBeenCalled()
        expect(logEvent).toHaveBeenCalledWith(expect.objectContaining({ message: 'error', fn: 'FolderTile.select', error: 'boom' }))
    })

    test('Enter and Space activate it from the keyboard', async () => {
        mockSelectDirectory.mockResolvedValue({ canceled: true })
        render(<FolderTile text="Pick" />)

        await act(async () => { fireEvent.keyDown(screen.getByRole('button'), { key: 'Enter' }) })
        await act(async () => { fireEvent.keyDown(screen.getByRole('button'), { key: ' ' }) })

        expect(mockSelectDirectory).toHaveBeenCalledTimes(2)
    })

    test('a second click while the picker is open is ignored', async () => {
        let resolve
        mockSelectDirectory.mockReturnValue(new Promise(r => { resolve = r }))
        render(<FolderTile text="Pick" />)

        await click()
        await click()
        expect(mockSelectDirectory).toHaveBeenCalledTimes(1)

        await act(async () => { resolve({ canceled: true }) })
    })

    test('a disabled tile does nothing', async () => {
        render(<FolderTile text="Pick" disabled />)

        await click()

        expect(mockSelectDirectory).not.toHaveBeenCalled()
        expect(logEvent).not.toHaveBeenCalled()
    })
})
