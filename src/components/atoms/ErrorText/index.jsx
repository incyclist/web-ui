import React from "react"
import styled from "styled-components"

export const Error = styled.p `
  color: red;
  font-size: ${props => props.size || '1vh'};
  text-align: left;
`

export const ErrorText = (props)  => {
    const {children,text,size} = props
    return( <div>
        <Error size={size}>{text || children}</Error>
    </div>)
}
