import React from 'react'
import styled from 'styled-components'
import { MessageBox } from '../../../molecules/dialogs/MessageBox'
import { Radio } from '../../../atoms'

const Text = styled.div`
    font-size: 2vh;
    padding: 1vh 0.5vw;
`

const Option = styled.label`
    display: flex;
    flex-direction: row;
    align-items: flex-start;
    gap: 0.6vw;
    font-size: 2vh;
    padding: 0.5vh 0.5vw;
    cursor: pointer;
`

/**
 * Confirmation before a route server is removed. If the server has routes in the list, the user chooses between
 * keeping and removing them. All texts come from the page service.
 */
export const RemoveServerDialog = ({ dialog, onKeepChange, onConfirm, onCancel }) => {
    if (!dialog)
        return null

    const { title, text, keepLabel, removeRoutesLabel, confirmLabel, removeRoutes } = dialog
    const hasRoutes = !!keepLabel

    return <MessageBox id='RemoveRouteServer' title={title} yes={confirmLabel} no='Cancel' defaultButton='Cancel'
        height={hasRoutes ? '34vh' : '22vh'} width='40vw' onYes={onConfirm} onNo={onCancel}>
        {text ? <Text>{text}</Text> : null}
        {hasRoutes ?
            <div role='radiogroup' aria-label='What happens to the routes'>
                <Option>
                    <Radio name='remove-routes' checked={!removeRoutes} onChange={() => onKeepChange?.(false)} />
                    <span>{keepLabel}</span>
                </Option>
                <Option>
                    <Radio name='remove-routes' checked={!!removeRoutes} onChange={() => onKeepChange?.(true)} />
                    <span>{removeRoutesLabel}</span>
                </Option>
            </div> : null}
    </MessageBox>
}
