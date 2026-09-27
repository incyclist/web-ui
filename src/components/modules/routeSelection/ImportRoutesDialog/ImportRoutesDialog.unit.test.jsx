import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'

const { mockImportRoutes, dialogProps } = vi.hoisted(() => ({
    mockImportRoutes: {
        displayProps: { phase: 'landing', routes: [], hasICloudDownloadFailures: false },
        scan: vi.fn(),
        importSingle: vi.fn(),
        importSelected: vi.fn(),
        cancel: vi.fn(),
    },
    dialogProps: [],
}))

vi.mock('../../../../hooks/routes/useImportRoutes', () => ({
    useImportRoutes: () => mockImportRoutes,
}))

// The Dialog molecule owns the fixed-size chrome this test needs to verify; stubbed here
// only to capture the width/height it was given (its own rendering is exercised by its own
// unit tests), while still rendering the real children so Landing/Result assertions work.
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dialog: (props) => {
            dialogProps.push({ width: props.width, height: props.height, onESC: props.onESC })
            return <div data-testid="dialog" title={props.title}>{props.children}</div>
        },
    }
})

import { ImportRoutesDialog, IMPORT_DIALOG_WIDTH, IMPORT_DIALOG_HEIGHT } from './ImportRoutesDialog'

describe('ImportRoutesDialog', () => {

    beforeEach(() => {
        vi.clearAllMocks()
        dialogProps.length = 0
        mockImportRoutes.displayProps = { phase: 'landing', routes: [], hasICloudDownloadFailures: false }
    })

    test('renders the Landing view on the landing phase, at the fixed dialog geometry', () => {
        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByText('Add a route')).toBeTruthy()
        expect(screen.getByText('Import a whole folder')).toBeTruthy()
        expect(dialogProps[0].width).toBe(IMPORT_DIALOG_WIDTH)
        expect(dialogProps[0].height).toBe(IMPORT_DIALOG_HEIGHT)
    })

    test('a failed single-route import shows the Result view with the reason, at the same geometry', () => {
        mockImportRoutes.displayProps = { phase: 'result', routes: [], error: "This file couldn't be read" }

        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByText("This file couldn't be read")).toBeTruthy()
        expect(screen.getByText('Pick another file')).toBeTruthy()
        expect(dialogProps[0].width).toBe(IMPORT_DIALOG_WIDTH)
        expect(dialogProps[0].height).toBe(IMPORT_DIALOG_HEIGHT)
    })

    test('a phase with no view yet (session 5.3) does not go blank, and keeps the same geometry', () => {
        mockImportRoutes.displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 3, failedFolders: 0 } }

        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByTestId('dialog')).toBeTruthy()
        expect(dialogProps[0].width).toBe(IMPORT_DIALOG_WIDTH)
        expect(dialogProps[0].height).toBe(IMPORT_DIALOG_HEIGHT)
        // not dismissable while a scan is in flight
        expect(dialogProps[0].onESC).toBeUndefined()
    })

    test('a successful single-route import auto-closes the dialog', () => {
        const onClose = vi.fn()
        mockImportRoutes.displayProps = { phase: 'result', routes: [], resultSuccess: { routeName: 'Alpe' } }

        render(<ImportRoutesDialog onClose={onClose} />)

        expect(onClose).toHaveBeenCalled()
    })

    test('"Pick another file" on a failed import calls cancel() to return to Landing', () => {
        mockImportRoutes.displayProps = { phase: 'result', routes: [], error: 'No video file found for this route' }

        render(<ImportRoutesDialog onClose={vi.fn()} />)
        screen.getByText('Pick another file').click()

        expect(mockImportRoutes.cancel).toHaveBeenCalled()
    })

    test('Esc closes the dialog on the landing phase', () => {
        const onClose = vi.fn()
        render(<ImportRoutesDialog onClose={onClose} />)

        expect(dialogProps[0].onESC).toBe(onClose)
    })
})
