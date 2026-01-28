import React from "react";
import styled from "styled-components";

import Loader from "react-spinners/BounceLoader";
import { CheckIcon, XCircleFillIcon } from "@primer/octicons-react";
import { Button } from "../../../atoms";

const IconButton = styled(Button)`
    justify-content:center;
    align-items: center;
    position: absolute;
    right:0;
    color:white;
    font-size:1.3vw;
    font-weight: bold;
    background: none;    
    height:${props => props.size};
    aspect-ratio : 1 / 1;
    margin-right: 1vw;   
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
    
    const onUnselectClicked = (e) => {
        e.preventDefault()
        if (onUnselect)
            onUnselect()
    }

    return (
        <Status>
            <LaunchStatusIcon status={state}/>
            <Text>{state}</Text>
            <IconButton size='4vh' onClick={onUnselectClicked}>x</IconButton>

        </Status>
    )
}