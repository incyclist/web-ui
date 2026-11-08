import React from "react";
import styled from "styled-components";

import Loader from "react-spinners/BounceLoader";
import { CheckIcon, XCircleFillIcon } from "@primer/octicons-react";

// on/off colours match the mobile toggle
const Toggle = styled.button`
    position: absolute;
    right: 1vw;
    top: 50%;
    transform: translateY(-50%);
    width: 3.9vh;
    height: 2.2vh;
    padding: 0;
    border: none;
    border-radius: 1.1vh;
    cursor: pointer;
    background: ${props => props.$on ? 'lightgreen' : '#767577'};
    &::after {
        content: '';
        position: absolute;
        top: 0.25vh;
        left: ${props => props.$on ? 'calc(100% - 1.95vh)' : '0.25vh'};
        width: 1.7vh;
        height: 1.7vh;
        border-radius: 50%;
        background: ${props => props.$on ? 'green' : '#f4f3f4'};
        transition: left 0.15s;
    }
`

// the right padding keeps the centred icon and state text clear of the toggle on narrow tiles:
// the toggle's width, its right offset and a small gap
const Status = styled.div`
    position: absolute;
    box-sizing: border-box;
    padding-right: calc(3.9vh + 1.5vw);
    overflow: hidden;
    white-space: nowrap;
    background: black;
    height: 20%;
    min-heigt: 20%;
    display: flex;
    flex-direction: row;
    font-size: 2vh;
    justify-content: center;
    align-items: center;
    text-align: center;

    width: 100%;
    top: 80%;
    left:0;
    color: white;
`

// one line only; min-width: 0 lets the flex item shrink below its text so the ellipsis can show
// as a last resort on a very narrow tile
const Text = styled.div`
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
    text-transform: ${props => props.$asIs ? 'none' : 'uppercase'};
    margin-left: 0.2vw;
    color: ${props => props.$searching ? '#f5a623' : 'inherit'};
`

// the page service's own footer copy is shown as written; otherwise the state text ('Found', shown
// amber while a search runs) or the connect state
const getActiveText = (footerText, stateText, state) => {
    if (footerText)
        return { text: footerText, asIs: true, searching: false }
    return { text: stateText ?? state, asIs: false, searching: Boolean(stateText) }
}

export const LaunchStatusIcon = ( {status}) => {


    switch (status) {
        case 'failed': return <XCircleFillIcon fill='red' size={24} />
        case 'connected': return <CheckIcon fill='green' size={24} />
        case 'connecting': return <div><Loader size={24} color='white'/></div>
        default: 
            return <Loader size={24}/>
            
    }
}


export const ConnectionStatus = ({state,disabled,footer,footerText,stateText,compact,onUnselect,onUse})=>{

    // the toggle is on while the capability is used; switching it off unselects the capability.
    // On a switched-off (T16) tile the toggle is off; switching it on restores the remembered
    // device with no new scan (onUse). stopPropagation keeps the click from also opening the
    // device list on the tile.
    const onToggleClicked = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (disabled) {
            if (onUse)
                onUse()
        }
        else if (onUnselect)
            onUnselect()
    }

    const active = getActiveText(footerText, stateText, state)

    // the footer copy already says how the tile stands (an icon could contradict it, e.g. a red
    // cross next to "waiting"), and while the helper is open the strip needs the room for the text
    const showIcon = !disabled && !footerText && !compact

    return (
        <Status>
            {showIcon && <LaunchStatusIcon status={state}/>}
            {disabled ?
                <Text>{footerText ?? footer ?? 'Not used'}</Text> :
                <Text $asIs={active.asIs} $searching={active.searching}>{active.text}</Text>
            }
            <Toggle
                type="button"
                role="switch"
                aria-checked={disabled ? "false" : "true"}
                aria-label="Use device"
                $on={!disabled}
                onClick={onToggleClicked}
            />

        </Status>
    )
}