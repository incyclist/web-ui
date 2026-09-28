import React from 'react';
import styled from 'styled-components';
import { Button, ButtonBar, ErrorText, Loader, Text } from '../../../../atoms';

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

/**
 * The folder scan's progress screen (phase `scanning`).
 *
 * `folderInfo` is the picker result the dialog shell captured when the user chose a folder in
 * `LandingView` - `useImportRoutes()`'s display props don't carry it (the scanner only reports
 * counts), so it is threaded down as a prop instead.
 *
 * Surfaces the incomplete-scan count (folders that could not be read) as soon as it is non-zero,
 * live. `<drive>` in the sentence is the chosen folder's display name, the only path-like value
 * available here.
 */
export const ScanningView = ({ displayProps, folderInfo, cancel }) => {
    const { scannedFolders = 0, failedFolders = 0 } = displayProps?.scanProgress ?? {};
    const folderName = folderInfo?.displayName;

    return (
        <>
            <Body>
                <Loader />
                <Text text={folderName ? `Looking for routes in ${folderName}…` : 'Looking for routes…'} />
                <Text text={`${scannedFolders} folders checked`} />
                {failedFolders > 0 && (
                    <ErrorText
                        size="1.6vh"
                        text={`Couldn't read everything — ${failedFolders} folders were unreachable. ${folderName ? `Check that ${folderName} is still connected.` : ''}`}
                    />
                )}
            </Body>
            <ButtonBar justify="center">
                <Button text="Cancel" onClick={cancel} />
            </ButtonBar>
        </>
    );
};
