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

const Status = styled.div`
    position: absolute;
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

const Text = styled.div`
    text-transform: uppercase;
    margin-left: 0.2vw;
`

export const LaunchStatusIcon = ( {status}) => {


    switch (status) {
        case 'failed': return <XCircleFillIcon fill='red' size={24} />
        case 'connected': return <CheckIcon fill='green' size={24} />
        case 'connecting': return <div><Loader size={24} color='white'/></div>
        default: 
            return <Loader size={24}/>
            
    }
}


export const ConnectionStatus = ({state,onUnselect})=>{

    // the toggle is on while the device is used; switching it off unselects the capability.
    // stopPropagation keeps the click from also opening the device list on the tile.
    const onToggleClicked = (e) => {
        e.preventDefault()
        e.stopPropagation()
        if (onUnselect)
            onUnselect()
    }

    return (
        <Status>
            <LaunchStatusIcon status={state}/>
            <Text>{state}</Text>
            <Toggle
                type="button"
                role="switch"
                aria-checked="true"
                aria-label="Use device"
                $on={true}
                onClick={onToggleClicked}
            />

        </Status>
    )
}