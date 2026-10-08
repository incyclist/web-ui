import React from 'react'
import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Observer } from 'incyclist-services'

vi.mock('../../../../../hooks', async (importOriginal) => {
    const actual = await importOriginal()
    return {
        ...actual,
        useFoldWindow: () => ({
            ref: { current: null },
            observer: new Observer(),
            isOutsideFold: () => false,
            getFoldEvent: (key) => `fold-${key}`,
        }),
    }
})

// Rows are stubbed - this suite covers the view's filtering/toolbar/phase wiring, not the row's
// own rendering (covered in ImportRow.unit.test.jsx).
vi.mock('./ImportRow', () => ({
    ImportRow: ({ route, selected }) => (
        <div data-testid={`row-${route.id}`} data-selected={String(selected)}>{route.label}</div>
    ),
}))

import { ParseSelectView } from './ParseSelectView'

const buildRoute = (id, overrides = {}) => ({
    id,
    label: `Route ${id}`,
    folder: 'Folder',
    format: 'rlv',
    distance: { value: 10, unit: 'km' },
    alreadyImported: false,
    parseState: 'parsed',
    importable: true,
    observer: new Observer(),
    ...overrides,
})

const baseProps = () => ({
    folderInfo: { uri: 'file:///D:/Videos', displayName: 'D:\\Videos' },
    cancel: vi.fn(),
    onClose: vi.fn(),
    importSelected: vi.fn(),
    selectedIds: new Set(),
    isSelected: () => false,
    toggleSelected: vi.fn(),
    selectAll: vi.fn(),
    deselectAll: vi.fn(),
})

describe('ParseSelectView', () => {

    test('falls back to the not-yet-implemented placeholder during the single-route import\'s transient "parsing" moment', () => {
        // no scanProgress at all - the signal that this is not a bulk scan
        const displayProps = { phase: 'parsing', routes: [], hasICloudDownloadFailures: false }
        render(<ParseSelectView displayProps={displayProps} {...baseProps()} />)

        expect(screen.queryByText(/selected/)).not.toBeInTheDocument()
        expect(screen.queryByTestId(/^row-/)).not.toBeInTheDocument()
    })

    test('shows the streaming progress header while parsing', () => {
        const displayProps = {
            phase: 'parsing',
            routes: [buildRoute('r1')],
            scanProgress: { scannedFolders: 3, failedFolders: 0 },
            parseProgress: { parsed: 5, total: 20 },
        }
        render(<ParseSelectView displayProps={displayProps} {...baseProps()} />)

        expect(screen.getByText('Reading routes… 5 of 20')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Import 0 routes/ })).toBeDisabled()
    })

    test('shows "no routes found" when a completed scan found nothing', () => {
        const displayProps = { phase: 'selecting', routes: [], scanProgress: { scannedFolders: 3, failedFolders: 0 } }
        render(<ParseSelectView displayProps={displayProps} {...baseProps()} />)

        expect(screen.getByText(/No routes found in D:\\Videos/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: 'Choose another folder' })).toBeInTheDocument()
    })

    test('renders every route while "selecting" and reports live counts on the toolbar', () => {
        const routes = [
            buildRoute('r1'),
            buildRoute('r2', { alreadyImported: true }),
            buildRoute('r3', { importable: false, errorReason: 'boom' }),
        ]
        const displayProps = { phase: 'selecting', routes, scanProgress: { scannedFolders: 3, failedFolders: 0 } }
        render(<ParseSelectView displayProps={displayProps} {...baseProps()} />)

        // "Hide already imported" is on by default - r2 is filtered out of view
        expect(screen.getByTestId('row-r1')).toBeInTheDocument()
        expect(screen.queryByTestId('row-r2')).not.toBeInTheDocument()
        expect(screen.getByTestId('row-r3')).toBeInTheDocument()

        expect(screen.getByLabelText('Hide already imported (1)')).toBeInTheDocument()
        expect(screen.getByLabelText('Only show problems (1)')).toBeInTheDocument()
    })

    test('the two visibility toggles filter the displayed rows without touching selection', () => {
        const routes = [
            buildRoute('r1'),
            buildRoute('r2', { alreadyImported: true }),
            buildRoute('r3', { importable: false, errorReason: 'boom' }),
        ]
        const displayProps = { phase: 'selecting', routes, scanProgress: { scannedFolders: 3, failedFolders: 0 } }
        const props = baseProps()
        render(<ParseSelectView displayProps={displayProps} {...props} />)

        // turn off "hide already imported" - r2 appears, selection callbacks untouched
        screen.getByLabelText(/Hide already imported/).click()
        expect(screen.getByTestId('row-r2')).toBeInTheDocument()
        expect(props.toggleSelected).not.toHaveBeenCalled()
        expect(props.selectAll).not.toHaveBeenCalled()

        // "only show problems" narrows to r3 alone
        screen.getByLabelText(/Only show problems/).click()
        expect(screen.queryByTestId('row-r1')).not.toBeInTheDocument()
        expect(screen.getByTestId('row-r3')).toBeInTheDocument()
        expect(props.toggleSelected).not.toHaveBeenCalled()
    })

    test('"only show problems" leaves out duplicates of a route in the same import', () => {
        const routes = [
            buildRoute('r1', { importable: false, errorReason: "couldn't read" }),
            buildRoute('r2', { importable: false, errorReason: 'Duplicate of Alpe', duplicateOf: 'Alpe' }),
        ]
        const displayProps = { phase: 'selecting', routes, scanProgress: { scannedFolders: 1, failedFolders: 0 } }
        render(<ParseSelectView displayProps={displayProps} {...baseProps()} />)

        expect(screen.getByLabelText('Only show problems (1)')).toBeInTheDocument()
        screen.getByLabelText(/Only show problems/).click()
        expect(screen.getByTestId('row-r1')).toBeInTheDocument()
        expect(screen.queryByTestId('row-r2')).not.toBeInTheDocument()
    })

    test('select all / deselect all wire directly to the hook', () => {
        const displayProps = { phase: 'selecting', routes: [buildRoute('r1')], scanProgress: { scannedFolders: 1, failedFolders: 0 } }
        const props = baseProps()
        render(<ParseSelectView displayProps={displayProps} {...props} />)

        screen.getByRole('button', { name: 'Select all' }).click()
        expect(props.selectAll).toHaveBeenCalled()

        screen.getByRole('button', { name: 'Deselect all' }).click()
        expect(props.deselectAll).toHaveBeenCalled()
    })

    test('Import button calls importSelected and reflects the selected count', () => {
        const displayProps = { phase: 'selecting', routes: [buildRoute('r1')], scanProgress: { scannedFolders: 1, failedFolders: 0 } }
        const props = { ...baseProps(), selectedIds: new Set(['r1']), isSelected: () => true }
        render(<ParseSelectView displayProps={displayProps} {...props} />)

        const importButton = screen.getByRole('button', { name: 'Import 1 routes' })
        expect(importButton).toBeEnabled()
        importButton.click()
        expect(props.importSelected).toHaveBeenCalled()
    })

    // Failed rows are keyed by their file name (the parsed route is missing), so two same-named files
    // from different folders collide. React reports that as a duplicate-key warning and may drop rows.
    describe('rows that share a file name', () => {
        let consoleError

        beforeEach(() => {
            consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
        })

        afterEach(() => {
            consoleError.mockRestore()
        })

        const duplicateKeyWarnings = () => consoleError.mock.calls.filter(
            args => args.some(arg => typeof arg === 'string' && /same key/i.test(arg))
        )

        // as the service builds it: the id is the bare file name, the fileUri is unique per file
        const failedRow = (id, folder) => buildRoute(id, {
            folder,
            fileUri: `file:///${folder}/${id}`,
            importable: false,
            errorReason: 'Duplicate of Marburg',
            duplicateOf: 'Marburg',
        })

        test('two failed files with the same name each keep their own row', () => {
            const routes = [
                buildRoute('r1'),
                failedRow('DE_Marburg-Lahntal.xml', 'Folder A'),
                failedRow('DE_Marburg-Lahntal.xml', 'Folder B'),
            ]
            const displayProps = { phase: 'selecting', routes, scanProgress: { scannedFolders: 2, failedFolders: 0 } }
            const props = baseProps()
            render(<ParseSelectView displayProps={displayProps} {...props} />)

            expect(screen.getAllByTestId('row-DE_Marburg-Lahntal.xml')).toHaveLength(2)
            expect(duplicateKeyWarnings()).toHaveLength(0)
        })

        test('rows streamed in after a same-named failed row are all rendered', () => {
            const parsing = (routes) => ({
                phase: 'parsing',
                routes,
                scanProgress: { scannedFolders: 2, failedFolders: 0 },
                parseProgress: { parsed: routes.length, total: 5 },
            })
            const props = baseProps()
            const { rerender } = render(
                <ParseSelectView displayProps={parsing([
                    buildRoute('r1'),
                    failedRow('DE_Marburg-Lahntal.xml', 'Folder A'),
                ])} {...props} />
            )

            rerender(
                <ParseSelectView displayProps={parsing([
                    buildRoute('r1'),
                    failedRow('DE_Marburg-Lahntal.xml', 'Folder A'),
                    failedRow('DE_Marburg-Lahntal.xml', 'Folder B'),
                    buildRoute('r4'),
                ])} {...props} />
            )

            expect(screen.getAllByTestId('row-DE_Marburg-Lahntal.xml')).toHaveLength(2)
            expect(screen.getByTestId('row-r4')).toBeInTheDocument()
            expect(duplicateKeyWarnings()).toHaveLength(0)
        })
    })
})
