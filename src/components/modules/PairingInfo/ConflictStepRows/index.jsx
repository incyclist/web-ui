import React from 'react';
import styled from 'styled-components';
import { SegmentedControl } from '../../../atoms/SegmentedControl';

const Rows = styled.div`
    display: flex;
    flex-direction: column;
`

const Row = styled.div`
    padding: 0.8vh 0;
    border-bottom: 1px solid #3c4a55;
    &:last-child {
        border-bottom: none;
    }
`

const RowTitle = styled.div`
    margin-bottom: 0.6vh;
    font-size: 1.8vh;
    font-weight: bold;
`

/**
 * One row per slot a device wants that already holds a different device: the slot's title, and
 * the choice between keeping the current device and giving the slot to the new one. The choice is
 * the one the service hands over ('keep' until the rider picks otherwise); a pick is only reported,
 * via `onChoice(capability, choice)`, and shows once the service hands the new choice back.
 *
 * Rendered by ConflictStepDialog, for a device found by the search and for the second step of the
 * device list alike.
 */
export const ConflictStepRows = ({ rows, onChoice }) => {
    if (!rows?.length)
        return null

    return (
        <Rows>
            {rows.map(row => (
                <Row key={row.capability}>
                    <RowTitle>{row.capabilityTitle}</RowTitle>
                    <SegmentedControl
                        name={`conflict-${row.capability}`}
                        label={row.capabilityTitle}
                        labelPosition='none'
                        fontSize='1.7vh'
                        options={[
                            { value: 'keep', label: row.keepLabel },
                            { value: 'replace', label: row.replaceLabel },
                        ]}
                        value={row.choice}
                        onValueChange={(choice) => onChoice?.(row.capability, choice)}
                    />
                </Row>
            ))}
        </Rows>
    )
}
