import React from 'react';
import styled from 'styled-components';
import { ErrorText } from '../../../../atoms';
import { Button, ButtonBar } from '../../../../atoms';

const Body = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: calc(100% - 7.7vh);
    text-align: center;
    padding: 2vh;
    box-sizing: border-box;
`;

/**
 * The single-route import's outcome screen.
 *
 * Success has no rendering here at all: the dialog shell closes itself as soon as
 * `resultSuccess` is set (the route appearing in the list behind it is the confirmation),
 * so this view only ever has something to show on failure - the reason, plus a way back
 * to the two tiles.
 */
export const ResultView = ({ error, onPickAnotherFile, onClose }) => {
    if (!error)
        return null;

    return (
        <>
            <Body>
                <ErrorText text={error} size="2vh" />
            </Body>
            <ButtonBar justify="center">
                <Button text="Pick another file" primary onClick={onPickAnotherFile} />
                <Button text="Close" onClick={onClose} />
            </ButtonBar>
        </>
    );
};
