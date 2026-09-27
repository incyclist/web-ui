import { describe, test, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { getImportErrorText, UNREADABLE_FILE_TEXT } from './importErrorText'
import { ActiveImportRow } from '../Search/ActiveImportRow'
import { ResultView } from './ImportRoutesDialog/views/ResultView'
import { CompleteView } from './ImportRoutesDialog/views/CompleteView'

// One underlying failure, in the two shapes the service hands it over in:
// - a dropped file: RouteListService.import() pins an ActiveImportCard whose `error` is the
//   RouteImportError itself ({code, message, missingExt})
// - a file picked in the dialog: RouteLibraryScannerService.importSingle() puts the same failure
//   on the display props as `error` (the text) and `failure` ({code, reason, missingExt})
// The service's own tests prove both entry points produce the same code/text for the same
// failure; these prove the same code renders as the same sentence on both surfaces.
const FAILURES = [
    { code: 'MISSING_COMPANION', reason: 'Missing companion file (.epp)', missingExt: 'epp',
        text: 'A file this route needs (.epp) is not in its folder' },
    { code: 'MISSING_COMPANION', reason: 'Missing companion file (.pgmf)', missingExt: 'pgmf',
        text: 'A file this route needs (.pgmf) is not in its folder' },
    { code: 'AVI_NOT_SUPPORTED', reason: 'AVI video not supported',
        text: 'Its video is an AVI file — Incyclist needs MP4' },
    { code: 'NO_VIDEO', reason: 'Video file not found in folder: a.mp4',
        text: 'No video file found for this route' },
    { code: 'PARSE_FAILED', reason: 'cannot parse <Track>', text: "This file couldn't be read" },
    { code: 'READ_FAILED', reason: 'no file found', text: "This file couldn't be read" },
    { code: 'UNSUPPORTED', reason: 'not a route control file', text: "This file couldn't be read" },
]

const droppedFileRow = ({ code, reason, missingExt }) => {
    const error = Object.assign(new Error(reason), { code, missingExt })
    const card = { getDisplayProperties: () => ({ name: 'route.epm', error, observer: null }) }
    return render(<ActiveImportRow card={card} onRetry={vi.fn()} onDelete={vi.fn()} />)
}

const pickedFileResult = ({ code, reason, missingExt }) =>
    render(<ResultView error={reason} failure={{ code, reason, missingExt }} onPickAnotherFile={vi.fn()} onClose={vi.fn()} />)

describe('import error sentence', () => {

    test.each(FAILURES)('$code ($reason): the dropped file\'s row and the dialog\'s result show the same sentence', (failure) => {
        const drop = droppedFileRow(failure)
        const dropText = drop.container.querySelector('.active-import').textContent
        drop.unmount()

        pickedFileResult(failure)

        expect(dropText).toContain(failure.text)
        expect(screen.getByText(failure.text)).toBeTruthy()
        // never the service's raw text
        expect(dropText).not.toContain(failure.reason)
        expect(screen.queryByText(failure.reason)).toBeNull()
    })

    test('a file among several picked at once is reported with the same sentence', async () => {
        const [failure] = FAILURES
        const displayProps = { completionSummary: { imported: 1, skipped: 0, errors: 1,
            failedRoutes: [{ name: 'route.epm', reason: failure.reason, code: failure.code, missingExt: failure.missingExt }] } }

        render(<CompleteView displayProps={displayProps} folderInfo={null} onClose={vi.fn()} />)
        fireEvent.click(screen.getByText('See what went wrong'))

        expect(await screen.findByText(`route.epm: ${failure.text}`)).toBeTruthy()
        expect(screen.queryByText(`route.epm: ${failure.reason}`)).toBeNull()
    })

    test('a missing or unknown code falls back to the unreadable-file sentence', () => {
        expect(getImportErrorText(undefined)).toBe(UNREADABLE_FILE_TEXT)
        expect(getImportErrorText({})).toBe(UNREADABLE_FILE_TEXT)
        expect(getImportErrorText({ code: 'SOMETHING_NEW' })).toBe(UNREADABLE_FILE_TEXT)
        expect(UNREADABLE_FILE_TEXT).toBe("This file couldn't be read")
    })
})
