import React from "react"
import { Row } from "../layout"
import styled from "styled-components"
import { Label } from "../input/base/EditField"

const TextDiv = styled.div`
    text-align: ${props=> props.align || 'left'};
    color:${props=> props.error?'red':undefined};
`
const View = styled(Row)`
    text-align: ${props=> props.textAlign||'left'};
    padding-bottom: ${props=> props.noPadding ? undefined: '1vh'};
    color: ${props=>props.color};
    font-size: ${props => props.size};

`

export const Text = (props) => {
    const {text,label,labelPosition,labelWidth,innerMargin,unit,align,color,size} = props
    const id = label
    const position = label ? labelPosition||'before' : undefined

    return <View {...props} >
        { (position ==='before') ? <Label labelPosition={position} labelWidth={labelWidth} innerMargin={innerMargin} htmlFor={id} >{label}</Label>:null }
    
        <TextDiv id={id} align={align} color={color} size={size}>
            {text || props.children}
        </TextDiv>

        { (position ==='after') ? <Label labelPosition={position} labelWidth={labelWidth} innerMargin={innerMargin}  htmlFor={id} >{label}</Label>:null }
        { unit ? <Label labelPosition='after' innerMargin={innerMargin}  htmlFor={id} >{unit}</Label>:null }
    </View>

}