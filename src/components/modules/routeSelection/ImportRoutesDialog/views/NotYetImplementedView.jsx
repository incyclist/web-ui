import React from 'react';
import styled from 'styled-components';
import { Loader } from '../../../../atoms';

const Center = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
`;

/**
 * Placeholder for the phases this session does not build (scanning, parsing, selecting,
 * ingesting, complete). Add a `<phase>: <View>` entry to `PHASE_VIEWS` in
 * `ImportRoutesDialog.jsx` as each real view lands - nothing else in this file needs to
 * change. Keeps the dialog from ever going blank while those views are still being built.
 */
export const NotYetImplementedView = () => (
    <Center>
        <Loader />
    </Center>
);
