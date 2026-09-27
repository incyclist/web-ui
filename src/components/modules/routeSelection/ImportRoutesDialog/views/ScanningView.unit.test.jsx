import React from 'react'
import { describe, test, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ScanningView } from './ScanningView'

describe('ScanningView', () => {

    test('shows the folder name and how many folders have been checked', () => {
        const displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 12, failedFolders: 0 } }
        render(<ScanningView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} cancel={() => {}} />)

        expect(screen.getByText('Looking for routes in D:\\Videos…')).toBeInTheDocument()
        expect(screen.getByText('12 folders checked')).toBeInTheDocument()
    })

    test('does not show an incomplete-scan warning while every folder was readable', () => {
        const displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 12, failedFolders: 0 } }
        render(<ScanningView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} cancel={() => {}} />)

        expect(screen.queryByText(/unreachable/)).not.toBeInTheDocument()
    })

    test('surfaces session 1.3\'s incomplete-scan count with the copy deck\'s exact wording', () => {
        const displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 12, failedFolders: 3 } }
        render(<ScanningView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} cancel={() => {}} />)

        expect(screen.getByText("Couldn't read everything — 3 folders were unreachable. Check that D:\\Videos is still connected.")).toBeInTheDocument()
    })

    test('Cancel calls the cancel callback', () => {
        const cancel = vi.fn()
        const displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 0, failedFolders: 0 } }
        render(<ScanningView displayProps={displayProps} folderInfo={{ displayName: 'D:\\Videos' }} cancel={cancel} />)

        screen.getByRole('button', { name: 'Cancel' }).click()
        expect(cancel).toHaveBeenCalled()
    })
})
