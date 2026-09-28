import React, { useCallback, useEffect, useState } from 'react';
import { Dialog } from '../../../molecules';
import { useImportRoutes } from '../../../../hooks/routes/useImportRoutes';
import { LandingView } from './views/LandingView';
import { ResultView } from './views/ResultView';
import { NotYetImplementedView } from './views/NotYetImplementedView';
import { ScanningView } from './views/ScanningView';
import { ParseSelectView } from './views/ParseSelectView';
import { IngestingView } from './views/IngestingView';
import { CompleteView } from './views/CompleteView';

// Fixed across every phase this dialog can be in. The Dialog molecule's default sizing is
// percentage-based (80% x 80%), which puts a checkbox list across ~2000px on a wide
// desktop screen, and resizing the dialog as the flow progresses would make it jump under
// the pointer - one box, only the content inside it changes.
export const IMPORT_DIALOG_WIDTH = 'min(980px, 70vw)';
export const IMPORT_DIALOG_HEIGHT = 'min(660px, 75vh)';

const TITLE = 'Import Routes';

// While one of these is running, nothing has been confirmed by the user yet that Esc/close
// should be allowed to interrupt without asking - the corresponding view is the one that
// owns its own Cancel/Stop affordance instead. Every other phase (including Landing
// and Result) closes normally on Esc.
const NON_DISMISSABLE_PHASES = new Set(['scanning', 'parsing', 'ingesting']);

// A folder scan populates `scanProgress` as soon as `RouteLibraryScannerService.scan()` starts,
// before the phase ever reaches 'parsing'; a single-route import never sets it at all. Both
// paths pass through phase 'parsing', so this is the reliable
// way to tell "streaming the bulk-scan selection list" apart from the single-route import's
// brief transient moment - not `routes.length`, which can legitimately be zero for a real scan
// of a folder with nothing importable in it.
const isBulkScanPhase = (displayProps) => displayProps?.scanProgress != null;

// One title per phase: "Import Routes" /
// "Select Routes" / "Importing" / "Import Finished". Phases with no distinct title of their own
// (landing, scanning, the single-route result) keep the dialog's default title.
const getDialogTitle = (phase, displayProps) => {
    if (phase === 'parsing')
        return isBulkScanPhase(displayProps) ? 'Select Routes' : 'Importing';
    if (phase === 'selecting')
        return 'Select Routes';
    if (phase === 'ingesting')
        return 'Importing';
    if (phase === 'complete')
        return 'Import Finished';
    return TITLE;
};

// Phase-to-view map. Add a `<phase>: <View>` entry here for each further phase - nothing else in
// this file, or in Landing/Result, needs to change for that to slot in. `parsing` and `selecting`
// share `ParseSelectView`, which treats them as one screen (streaming vs. complete), and
// itself resolves the 'parsing' ambiguity noted above.
const PHASE_VIEWS = {
    landing: LandingView,
    result: ResultView,
    scanning: ScanningView,
    parsing: ParseSelectView,
    selecting: ParseSelectView,
    ingesting: IngestingView,
    complete: CompleteView,
};

/**
 * The desktop Import Routes dialog. Owns the fixed dialog chrome and the phase-to-view
 * switch; the phases themselves are wired to `useImportRoutes()` and handed
 * down as props so each view stays a plain, testable presentational component.
 *
 * Mounting this component opens the dialog; unmounting it closes it (`useImportRoutes()`
 * already tears the scanner down on unmount). `onClose` is called for every other way the
 * dialog wants to close itself - a successful single-route import, Esc, or an explicit
 * button - and it is the caller's job to stop rendering this component in response.
 */
export const ImportRoutesDialog = ({ onClose }) => {
    const {
        displayProps, scan, importSingle, importSelected, cancel,
        selectedIds, isSelected, toggleSelected, selectAll, deselectAll,
    } = useImportRoutes();
    const { phase, resultSuccess, error, failure } = displayProps;

    // The picker result for the folder the user chose - `useImportRoutes()`'s display props don't
    // carry it (the scanner only ever reports counts back), and the Scanning/Parse-Select/Complete
    // views need it to name the folder in their copy. Captured here, once, rather than
    // threading it through the hook.
    const [folderInfo, setFolderInfo] = useState(null);

    useEffect(() => {
        // A successful single-route import closes the dialog on its own - the route
        // appearing in the list behind it is the confirmation, no explicit "Done" click.
        // This is a deliberate divergence from mobile's success screen.
        if (phase === 'result' && resultSuccess)
            onClose?.();
    }, [phase, resultSuccess, onClose]);

    // "Pick another file", on a failed single-route import, returns to Landing. Nothing has
    // been written yet at this point, so cancel()'s reset-to-landing is exactly right here.
    const onPickAnotherFile = useCallback(() => {
        cancel();
    }, [cancel]);

    const onSelectFolder = useCallback((info) => {
        setFolderInfo(info);
        scan(info);
    }, [scan]);

    const View = PHASE_VIEWS[phase] ?? NotYetImplementedView;
    const dismissable = !NON_DISMISSABLE_PHASES.has(phase);

    return (
        <Dialog
            id="ImportRoutes"
            title={getDialogTitle(phase, displayProps)}
            width={IMPORT_DIALOG_WIDTH}
            height={IMPORT_DIALOG_HEIGHT}
            onESC={dismissable ? onClose : undefined}
            onOutsideClicked={dismissable ? onClose : undefined}
        >
            <View
                displayProps={displayProps}
                folderInfo={folderInfo}
                onAddRoute={importSingle}
                onSelectFolder={onSelectFolder}
                error={error}
                failure={failure}
                onPickAnotherFile={onPickAnotherFile}
                onClose={onClose}
                cancel={cancel}
                importSelected={importSelected}
                selectedIds={selectedIds}
                isSelected={isSelected}
                toggleSelected={toggleSelected}
                selectAll={selectAll}
                deselectAll={deselectAll}
            />
        </Dialog>
    );
};
