import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { Button, ButtonBar, ProgressBar, Text } from '../../../../atoms';
import { MessageBox } from '../../../../molecules';

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
 * The ingest-progress screen (phase `ingesting`). No user interaction beyond
 * Stop - the shell's `NON_DISMISSABLE_PHASES` already blocks Esc/outside-click for this phase, so
 * this view only owns the Stop button and the one confirmation it requires.
 *
 * "Stop" asks once before acting - unlike Cancel in the earlier phases, ingest has
 * already started writing routes, so backing out needs a beat of confirmation rather than the
 * silent "nothing has happened yet" return the other phases get.
 */
export const IngestingView = ({ displayProps, cancel }) => {
    const { current = 0, total = 0, currentName = '' } = displayProps?.ingestProgress ?? {};
    const [confirmStop, setConfirmStop] = useState(false);
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <>
            <Body>
                <Text text="Adding routes to your library" />
                <Text text={currentName} />
                <Text text={`${current} of ${total}`} />
                <ProgressBar completed={pct} height="1.5vh" width="60%" />
                <Text text="You can keep using Incyclist — this runs in the background." />
            </Body>
            <ButtonBar justify="center">
                <Button text="Stop" onClick={() => setConfirmStop(true)} />
            </ButtonBar>

            {confirmStop && createPortal(
                <MessageBox
                    title="Stop importing?"
                    text="Routes already added are kept."
                    yes="Stop"
                    no="Keep going"
                    defaultButton="Keep going"
                    center
                    onYes={() => { setConfirmStop(false); cancel(); }}
                    onNo={() => setConfirmStop(false)}
                />,
                document.body,
            )}
        </>
    );
};
