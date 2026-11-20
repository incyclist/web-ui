import React, { useCallback } from 'react';
import styled from 'styled-components';
import { useRouteServersSettings } from '../../../../../hooks/routes/useRouteServersSettings';
import { RouteServersAdd } from '../../../Settings/Routes/RouteServersAdd';

const Area = styled.div`
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    padding: 2vh 1vw;
    overflow-y: auto;
    color: white;
`;

/**
 * "Add a route server" step of the Import Routes dialog: the add view of the route servers replaces the landing
 * tiles in place (no second modal). Back returns to the landing view; once a server was added the whole dialog closes.
 */
export const RouteServersView = ({ onBack, onClose }) => {
    const onClosed = useCallback((last) => {
        if (last?.manual?.state === 'success')
            onClose?.();
        else
            onBack?.();
    }, [onBack, onClose]);

    const { props, actions } = useRouteServersSettings('import', onClosed);

    return <RouteServersImportView {...props} actions={actions} />;
};

export const RouteServersImportView = ({ known, knownNote, manual, trustNote, actions }) => {
    if (!manual)
        return null;

    return (
        <Area>
            <RouteServersAdd known={known} knownNote={knownNote} manual={manual} trustNote={trustNote} actions={actions} />
        </Area>
    );
};
