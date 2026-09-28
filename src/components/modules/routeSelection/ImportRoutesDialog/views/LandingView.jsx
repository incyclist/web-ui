import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Dropzone, FolderTile } from '../../../../molecules';
import { Button, ButtonBar } from '../../../../atoms';
import { DEFAULT_FILTERS } from '../../UploadCard/summary';

// UploadCard's combined "Routes" filter (gpx, epm, xml), extended with .rlv - the
// per-format entries underneath it are reused unchanged, so there is exactly one place
// that knows which formats a route control file can be.
export const ADD_ROUTE_FILTERS = DEFAULT_FILTERS.map((filter, index) =>
    index === 0 ? { ...filter, extensions: [...filter.extensions, 'rlv'] } : filter
);

const TilesArea = styled.div`
    display: flex;
    flex-direction: row;
    align-items: stretch;
    justify-content: center;
    gap: 2vw;
    width: 100%;
    height: calc(100% - 5vh - 7.7vh);
    padding: 3vh 2vw 0 2vw;
    box-sizing: border-box;
`;

const TileTitle = styled.div`
    font-size: 2.2vh;
    font-weight: bold;
    color: white;
`;

const TileSubline = styled.div`
    font-size: 1.5vh;
    color: white;
    opacity: 0.8;
`;

const TileContent = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1vh;
    padding: 2vh;
    text-align: center;
`;

// Dropzone and FolderTile render their own width/height as a plain CSS size, not a flex-item
// share of the row - without this wrapper the first takes 100% of the whole row's width (its
// "width" prop) and squeezes the other down to whatever's left, rather than the two tiles sharing
// space equally.
const TileWrapper = styled.div`
    flex: 1;
    display: flex;
`;

const HintText = styled.div`
    width: 100%;
    height: 5vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    font-size: 1.3vh;
    color: white;
    opacity: 0.7;
`;

/**
 * The Import Routes dialog's landing screen - two tiles ("Add a route" / "Import a whole
 * folder"). Desktop does not ask the user to classify their own file: the parser already
 * tells single route files apart from a folder scan.
 *
 * "Add a route" allows picking several files at once (which is also how many GPX routes are
 * added in one go - a folder import only looks for video routes); every picked file is handed
 * on, as an array.
 *
 * Presentational only - `onAddRoute`/`onSelectFolder` are `useImportRoutes()`'s
 * `importSingle`/`scan`, wired in by the dialog shell.
 */
export const LandingView = ({ onAddRoute, onSelectFolder, onClose }) => {
    const handleAddRouteDrop = useCallback((dropInfo) => {
        const files = (Array.isArray(dropInfo) ? dropInfo : [dropInfo]).filter(Boolean);
        if (files.length > 0 && onAddRoute)
            onAddRoute(files);
    }, [onAddRoute]);

    return (
        <>
            <TilesArea>
                <TileWrapper>
                    <Dropzone
                        id="add-route-tile"
                        width="100%"
                        height="100%"
                        multiple={true}
                        filters={ADD_ROUTE_FILTERS}
                        onDrop={handleAddRouteDrop}
                        text={
                            <TileContent>
                                <TileTitle>Add a route</TileTitle>
                                <TileSubline>One route from a file on your computer — GPX, EPM, RLV or XML</TileSubline>
                            </TileContent>
                        }
                    />
                </TileWrapper>
                <TileWrapper>
                    <FolderTile
                        id="import-folder-tile"
                        onSelect={onSelectFolder}
                        text={
                            <TileContent>
                                <TileTitle>Import a whole folder</TileTitle>
                                <TileSubline>Find every video route in a folder and its sub-folders — a library on a disk or NAS</TileSubline>
                            </TileContent>
                        }
                    />
                </TileWrapper>
            </TilesArea>
            <HintText>…or drop route files anywhere on the Routes page</HintText>
            <ButtonBar justify="center">
                <Button text="Close" onClick={onClose} />
            </ButtonBar>
        </>
    );
};
