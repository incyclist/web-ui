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
 * Fallback for a phase that has no view of its own, and for the brief 'parsing' moment of a
 * single-route import. Add a `<phase>: <View>` entry to `PHASE_VIEWS` in
 * `ImportRoutesDialog.jsx` for a phase that needs one. Keeps the dialog from ever going blank.
 */
export const NotYetImplementedView = () => (
    <Center>
        <Loader />
    </Center>
);
