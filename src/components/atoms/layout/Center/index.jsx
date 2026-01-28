import styled from "styled-components"

const width = (props) => props.width || '100%'
const height = (props) => props.height || '100%'

export const Center = styled.div`

    position: ${props => props.position || 'absolute'};
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    width:${props => width(props) };
    height:${props => height(props) };
`

