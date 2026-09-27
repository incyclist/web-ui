import { describe, test, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'

const { mockImportRoutes, mockSelectDirectory, dialogProps } = vi.hoisted(() => ({
    mockImportRoutes: {
        displayProps: { phase: 'landing', routes: [], hasICloudDownloadFailures: false },
        scan: vi.fn(),
        importSingle: vi.fn(),
        importSelected: vi.fn(),
        cancel: vi.fn(),
    },
    mockSelectDirectory: vi.fn(),
    dialogProps: [],
}))

vi.mock('../../../../hooks/routes/useImportRoutes', () => ({
    useImportRoutes: () => mockImportRoutes,
}))

// Only the folder-capture test drives Landing's real "Import a whole folder" tile, which talks
// to the native picker binding - stubbed the same way LandingView's own suite does.
vi.mock('../../../../bindings/native-ui', () => ({
    useAppUI: () => ({ selectDirectory: mockSelectDirectory }),
}))

// The Dialog molecule owns the fixed-size chrome this test needs to verify; stubbed here
// only to capture the width/height it was given (its own rendering is exercised by its own
// unit tests), while still rendering the real children so Landing/Result assertions work.
vi.mock('../../../molecules', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        Dialog: (props) => {
            dialogProps.push({ width: props.width, height: props.height, onESC: props.onESC, onOutsideClicked: props.onOutsideClicked })
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

    test('a failed single-route import shows the sentence for the failure\'s code', () => {
        mockImportRoutes.displayProps = { phase: 'result', routes: [], error: 'AVI video not supported',
            failure: { code: 'AVI_NOT_SUPPORTED', reason: 'AVI video not supported' } }

        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByText('Its video is an AVI file — Incyclist needs MP4')).toBeTruthy()
    })

    test('several picked files report their summary without a folder line', () => {
        mockImportRoutes.displayProps = { phase: 'complete', routes: [], completionSummary: { imported: 3, skipped: 0, errors: 0, failedRoutes: [] } }

        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByText('3 routes added')).toBeTruthy()
        expect(screen.queryByText(/The videos stay where they are/)).toBeNull()
    })

    test('a phase with no view at all does not go blank, and keeps the same geometry', () => {
        // 'error' is declared on ImportDisplayProps but never actually assigned by the service -
        // the one phase value genuinely unmapped now that session 5.3 filled in the rest.
        mockImportRoutes.displayProps = { phase: 'error', routes: [], error: 'unexpected' }

        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByTestId('dialog')).toBeTruthy()
        expect(dialogProps[0].width).toBe(IMPORT_DIALOG_WIDTH)
        expect(dialogProps[0].height).toBe(IMPORT_DIALOG_HEIGHT)
    })

    test('renders the real Scanning view once scanning, with its own title and non-dismissable while it runs', () => {
        mockImportRoutes.displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 3, failedFolders: 0 } }

        render(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByText('3 folders checked')).toBeTruthy()
        expect(screen.getByTestId('dialog').title).toBe('Import Routes')
        // not dismissable while a scan is in flight
        expect(dialogProps[0].onESC).toBeUndefined()
    })

    test('titles the dialog per phase, exactly per the copy deck', () => {
        mockImportRoutes.displayProps = { phase: 'selecting', routes: [], scanProgress: { scannedFolders: 1, failedFolders: 0 } }
        const { rerender } = render(<ImportRoutesDialog onClose={vi.fn()} />)
        expect(screen.getByTestId('dialog').title).toBe('Select Routes')

        mockImportRoutes.displayProps = { phase: 'ingesting', routes: [], ingestProgress: { current: 1, total: 2, currentName: 'A' } }
        rerender(<ImportRoutesDialog onClose={vi.fn()} />)
        expect(screen.getByTestId('dialog').title).toBe('Importing')

        mockImportRoutes.displayProps = { phase: 'complete', routes: [], completionSummary: { imported: 1, skipped: 0, errors: 0, failedRoutes: [] } }
        rerender(<ImportRoutesDialog onClose={vi.fn()} />)
        expect(screen.getByTestId('dialog').title).toBe('Import Finished')
    })

    test('captures the chosen folder from Landing and passes it down to Scanning', async () => {
        mockSelectDirectory.mockResolvedValue({ selected: 'D:\\Videos', displayName: 'D:\\Videos' })
        const { rerender } = render(<ImportRoutesDialog onClose={vi.fn()} />)

        // Landing calls onSelectFolder with the picker result - the shell must remember it
        // (useImportRoutes()'s display props never carry it, only counts) so Scanning can name
        // the folder in its copy.
        await act(async () => {
            fireEvent.click(screen.getByText('Import a whole folder'))
        })

        expect(mockImportRoutes.scan).toHaveBeenCalledWith({ uri: 'D:\\Videos', displayName: 'D:\\Videos' })

        mockImportRoutes.displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders: 0, failedFolders: 0 } }
        rerender(<ImportRoutesDialog onClose={vi.fn()} />)

        expect(screen.getByText('Looking for routes in D:\\Videos…')).toBeTruthy()
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

    test('a visible close button is shown on Landing and closes the dialog when clicked', () => {
        const onClose = vi.fn()
        render(<ImportRoutesDialog onClose={onClose} />)

        expect(dialogProps[0].onOutsideClicked).toBe(onClose)
        fireEvent.click(screen.getByText('Close'))
        expect(onClose).toHaveBeenCalled()
    })

    test('the close button (and clicking outside) is hidden during a non-dismissable phase', () => {
        mockImportRoutes.displayProps = { phase: 'scanning', routes: [], scanProgress: { scannedFolders:1, failedFolders:0 } }
        const onClose = vi.fn()
        render(<ImportRoutesDialog onClose={onClose} />)

        expect(screen.queryByText('Close')).toBeNull()
        expect(dialogProps[0].onOutsideClicked).toBeUndefined()
    })
})
