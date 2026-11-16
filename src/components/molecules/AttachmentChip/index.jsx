import React from 'react'
import styled from 'styled-components'
import { XIcon } from '@primer/octicons-react'
import { copyPropsExcluding } from '../../../utils/props'
import { Icon } from '../../atoms'

const ACCENT = '#dd9933'
const HOVER = '#8dc100'

const Chip = styled.div`
    display: flex;
    align-items: center;
    align-self: flex-start;
    box-sizing: border-box;
    width: fit-content;
    max-width: 100%;
    height: 3.6vh;
    min-height: 3.6vh;
    border-radius: 1.8vh;
    border: 1px solid ${ACCENT};
    background: rgba(221, 153, 51, 0.18);
    margin: ${props => `1vh ${props.$margin ?? 0}`};
    padding: 0 0.3vh 0 1.2vh;
    font-size: 1.8vh;
    font-weight: 600;
    color: ${props => props.theme?.dialogContent?.text ?? 'white'};

    button {
        color: inherit;
        border-radius: 50%;
        flex-shrink: 0;
        float: none;
        cursor: pointer;
    }
    button:hover {
        background: none;
        color: ${HOVER};
    }
    button:focus-visible {
        outline: 2px solid white;
        outline-offset: 1px;
    }
    button svg {
        width: 1.8vh;
        height: 1.8vh;
    }
`

const Text = styled.span`
    flex: 1 1 auto;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`

const Prefix = styled.span`
    flex-shrink: 0;
    margin-right: 0.6vh;
`

const Close = (props) => {
    const childProps = copyPropsExcluding(props, ['size', 'width', 'height'])
    return <XIcon {...childProps} size={16} />
}

/**
 * Inline "<Label>: <name> [x]" pill, shown in details dialogs when a route/workout is attached elsewhere.
 * Without `onClear` the chip is read-only (no [x]).
 */
export const AttachmentChip = ({ label, name, onClear, id, margin }) => {
    const labelLower = String(label ?? '').toLowerCase()
    const chipId = id ?? `attachment-${labelLower}`

    return (
        <Chip id={chipId} $margin={margin} className='attachment-chip'>
            <Prefix>{label}:</Prefix>
            <Text title={name}>{name}</Text>
            {onClear ?
                <Icon
                    id={`clear ${labelLower}`}
                    ariaLabel={`Clear ${labelLower}`}
                    width='3.6vh'
                    height='3.4vh'
                    margin={0}
                    padding={0}
                    logContext={{ name }}
                    onClick={onClear}
                >
                    <Close />
                </Icon>
                : null}
        </Chip>
    )
}
