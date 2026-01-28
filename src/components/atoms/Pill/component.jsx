import React from "react"
import { AppThemeProvider } from "../../../theme"
import styled from "styled-components"
import { copyPropsExcluding } from "../../../utils/props"

const fontSizes = {
    small: '1vh',
    medium: '1.3vh',
    large: '1.5vh'
}

const radiuses = {
    small: '1vh',
    medium: '1.5vh',
    large: '2vh'
}

const background = (props) => {
    if (props.color)
        return props.color

    if (props.status) {
        let status = props.status
        try {
            status = props.status.toLowercase()
        }
        catch {}
        return props.theme.colors[status]

    }
}

const fontColor = (props) => {
    if (props.textColor)
        return props.textColor

    if (props.status) {
        let status = props.status
        try {
            status = props.status.toLowercase()
        }
        catch {}
        
        return props.theme.colors[`${status}Text`]

    }
}

const StyledPill = styled.span`
    background: ${props=> background(props)};
    color: ${props=> fontColor(props)};
    border-radius: ${props=>  props.radius || radiuses[props.size?.toString().toLowerCase()] || radiuses['medium']};
    font-size: ${props=> props.fontSize || fontSizes[props.size?.toString().toLowerCase()]|| fontSizes['medium'] };
    display:inline-block;  
    width: fit-content;
    padding: 0.1vh 1ch 0.1vh 1ch;
    margin: ${props => props.margin};
`

export const Pill = (  props) => {

    const childProps = copyPropsExcluding(props,['text','children'])
    
    return <AppThemeProvider>
        <StyledPill  {...childProps} >
            {props.text}
            {props.children}
        </StyledPill>
    </AppThemeProvider>

}