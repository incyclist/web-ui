import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, ButtonBar, CheckBox, Dynamic, ProgressBar, TableContainer, Text } from '../../../../atoms';
import { AppThemeProvider } from '../../../../../theme';
import { useFoldWindow } from '../../../../../hooks';
import { NotYetImplementedView } from './NotYetImplementedView';
import { ImportRow } from './ImportRow';

const Body = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5vh;
    height: calc(100% - 7.7vh);
    text-align: center;
    padding: 2vh;
    box-sizing: border-box;
`;

const ProgressHeader = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5vh;
    padding: 1vh 2vw 0 2vw;
    box-sizing: border-box;
`;

const Toolbar = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 1.5vw;
    padding: 1vh 2vw;
    box-sizing: border-box;
`;

const Spacer = styled.div`
    flex: 1;
`;

const getRouteKey = (route, idx) => route?.id ?? `route-${idx}`;

/**
 * The folder scan's parse-select screen (ux.md §5.3) - phases `parsing` (the list streams in) and
 * `selecting` (parse complete, full list, checkboxes enabled). Both phases render the same table;
 * `parsing` additionally shows the "Reading routes…" progress header and disables Import.
 *
 * `phase==='parsing'` is shared with a brief transient moment during a single-route import
 * (session 5.2's territory: the "Importing <file>" screen, not built yet). That path never sets
 * `scanProgress` - only `RouteLibraryScannerService.scan()` does, and it does so before the phase
 * ever reaches 'parsing' - so its absence is the reliable signal that this render is not a bulk
 * scan. Falls back to the same "nothing built yet" placeholder that phase rendered before this
 * view existed, rather than showing an empty selection table for a single-file import.
 */
export const ParseSelectView = ({
    displayProps, folderInfo, cancel, onClose,
    importSelected, selectedIds, isSelected, toggleSelected, selectAll, deselectAll,
}) => {
    const { phase, routes, parseProgress, scanProgress } = displayProps ?? {};

    const [hideAlreadyImported, setHideAlreadyImported] = useState(true);
    const [onlyProblems, setOnlyProblems] = useState(false);

    const allRoutes = routes ?? [];

    const { ref, observer, isOutsideFold, getFoldEvent } = useFoldWindow({
        items: allRoutes.filter(route => {
            if (hideAlreadyImported && route.alreadyImported)
                return false;
            if (onlyProblems && route.errorReason == null)
                return false;
            return true;
        }),
        getKey: getRouteKey,
    });

    if (scanProgress == null)
        return <NotYetImplementedView />;

    const isStreaming = phase === 'parsing';
    const selectedCount = selectedIds?.size ?? 0;
    const alreadyImportedCount = allRoutes.filter(route => route.alreadyImported).length;
    const problemCount = allRoutes.filter(route => route.errorReason != null).length;

    // The scanner deliberately excludes GPX (§4.7/§5.6) - a folder with none of the video-route
    // formats it looks for reaches 'selecting' with an empty list rather than an empty table.
    if (phase === 'selecting' && allRoutes.length === 0) {
        return (
            <>
                <Body>
                    <Text text={`No routes found in ${folderInfo?.displayName ?? 'that folder'}`} />
                    <Text text="This looks for video routes (.epm, .rlv, .xml files), including in sub-folders. To add GPX routes, use 'Add a route' or drop the files onto the Routes page." />
                </Body>
                <ButtonBar justify="center">
                    <Button text="Choose another folder" primary onClick={cancel} />
                    <Button text="Close" onClick={onClose} />
                </ButtonBar>
            </>
        );
    }

    const visibleRoutes = allRoutes.filter(route => {
        if (hideAlreadyImported && route.alreadyImported)
            return false;
        if (onlyProblems && route.errorReason == null)
            return false;
        return true;
    });

    const parsed = parseProgress?.parsed ?? 0;
    const total = parseProgress?.total ?? allRoutes.length;
    const pct = total > 0 ? Math.round((parsed / total) * 100) : 0;

    return (
        <>
            {isStreaming && (
                <ProgressHeader>
                    <Text text={`Reading routes… ${parsed} of ${total}`} />
                    <ProgressBar completed={pct} height="1vh" width="60%" />
                </ProgressHeader>
            )}

            <Toolbar>
                <Button text="Select all" onClick={selectAll} />
                <Button text="Deselect all" onClick={deselectAll} />
                <CheckBox
                    label={`Hide already imported (${alreadyImportedCount})`}
                    checked={hideAlreadyImported}
                    onValueChange={setHideAlreadyImported}
                />
                <CheckBox
                    label={`Only show problems (${problemCount})`}
                    checked={onlyProblems}
                    onValueChange={setOnlyProblems}
                />
                <Spacer />
                <Text text={`${selectedCount} selected`} />
            </Toolbar>

            <AppThemeProvider>
                <TableContainer className="import-routes" width="100%" height="calc(100% - 20vh)" ref={ref}>
                    {visibleRoutes.map((route, idx) => {
                        const key = getRouteKey(route, idx);
                        return (
                            <Dynamic observer={observer} key={key} event={getFoldEvent(key)} prop="outsideFold">
                                <ImportRow
                                    route={route}
                                    outsideFold={isOutsideFold(key)}
                                    selected={isSelected(route.id)}
                                    onToggle={() => toggleSelected(route.id)}
                                />
                            </Dynamic>
                        );
                    })}
                </TableContainer>
            </AppThemeProvider>

            <ButtonBar justify="center">
                <Button text="Cancel" onClick={cancel} />
                <Button
                    text={`Import ${selectedCount} routes`}
                    primary
                    disabled={isStreaming || selectedCount === 0}
                    onClick={importSelected}
                />
            </ButtonBar>
        </>
    );
};
