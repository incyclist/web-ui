import styled from "styled-components";
import {Column } from '../../../atoms'



export const Container = styled(Column)`
    z-index: 0;
    position: relative;
    background: ${props => props.theme?.pageLists?.background};

    
    user-select: none;
    padding: 0.5vh 0 1vh 0;
    margin-top: 0.5vh;
    color: white;
    width: 100%;
    min-width: 100%;
`

