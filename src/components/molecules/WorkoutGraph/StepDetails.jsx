import React from "react"
import { getStepDuration, getStepPower } from "./utils";
import styled from 'styled-components';
import { StepText } from "./StepText";

const StepInfo = styled.div`
    background: white;
    font-weight: normal;
    text-align: left;
    border: 1px solid transparent;
    white-space: nowrap;
    font-size: 2.2vh;
    color: black;
`

export const StepDetails = ({value,ftp}) => {
    
    if ( value===undefined) {
        return <div></div>
    }

    const step = value.step;
    return ( 
        <StepInfo>
            { StepText(step) }
            Duration: {getStepDuration(step)} <br/>
            Power: { getStepPower(step,ftp)}  <br/>
        </StepInfo>
    )

}