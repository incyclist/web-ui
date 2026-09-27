import React, { useState } from 'react';
import styled from 'styled-components';
import { Button, ButtonBar, Text } from '../../../../atoms';
import { getImportErrorText } from '../../importErrorText';

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

const FailedList = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.5vh;
    max-height: 20vh;
    overflow-y: auto;
`;

/**
 * The bulk-import summary screen (ux.md §5.3/§9, phase `complete`) - counts plus the "videos stay
 * where they are" note, exact copy-deck wording throughout.
 */
export const CompleteView = ({ displayProps, folderInfo, onClose }) => {
    const { imported = 0, skipped = 0, errors = 0, failedRoutes = [] } = displayProps?.completionSummary ?? {};
    const [showDetails, setShowDetails] = useState(false);

    return (
        <>
            <Body>
                <Text text={`${imported} routes added`} />
                <Text text={`${skipped} already in your library · ${errors} could not be imported`} />

                {errors > 0 && !showDetails && (
                    <Button text="See what went wrong" onClick={() => setShowDetails(true)} />
                )}
                {showDetails && (
                    <FailedList>
                        {failedRoutes.map(failed => (
                            <Text key={failed.name} text={`${failed.name}: ${getImportErrorText(failed)}`} />
                        ))}
                    </FailedList>
                )}

                {folderInfo?.displayName && (
                    <Text text={`The videos stay where they are. Keep ${folderInfo.displayName} connected to ride them.`} />
                )}
            </Body>
            <ButtonBar justify="center">
                <Button text="Done" primary onClick={onClose} />
            </ButtonBar>
        </>
    );
};
