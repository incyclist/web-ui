import { EventLogger } from "gd-eventlog"
import React from "react"
import styled from "styled-components"
import { copyPropsExcluding } from "../../../../utils/props"

const Input = styled.input`
    display: inline-block;
    align-items: center;
    font-size: inherit;
    width:${ props=>props.fontSize};
    height:${ props=>props.fontSize};
    margin-right: ${ props=>props.innerMargin||'0.4vw'};
`
//     margin-left: 1vw
const Label = styled.label`
    display: inline-block;
    align-items: center;
`

const Container = styled.div`
    text-align: ${props=> props.textAlign||'left'};
    vertical-align: middle;
    font-size: ${ props=>props.fontSize}    
`

export const CheckBox = (props) => {

    const {label,onClick,onValueChange,labelPosition='after',labelWidth, innerMargin='0.4vw'} = props
    const childProps = copyPropsExcluding( props, ['value','label','onClick','onValueChange','labelPosition','labelWidth','innerMargin'])
    childProps.checked = props.checked ?? props.value
    const id = props.id || `check-${label}`

    const logger = new EventLogger('Incyclist')


    const onChange = (e)=> {
        const checked = e?.target?.checked
        logger.logEvent( {message: 'checkbox clicked',checkbox:label,checked, eventSource:'user'})
        if (onClick)
            onClick(checked)
        if (onValueChange)
            onValueChange(checked)
        
    }

    return  <Container {...childProps}> 
        { (labelPosition ==='before') ? <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin} htmlFor={id} >{label}</Label>:null }
        <Input type="checkbox" id={id} {...childProps} onChange={onChange} /> 
        { (labelPosition ==='after') ? <Label labelPosition={labelPosition} labelWidth={labelWidth} innerMargin={innerMargin}  htmlFor={id} >{label}</Label>:null }

    </Container>
}


