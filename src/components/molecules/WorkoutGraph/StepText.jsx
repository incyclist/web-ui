import React from "react"

export const StepText = (step) =>{
    if (step.text&&step.text!=='') return (<div>{step.text} <br/></div>)
    return null;
    
}

