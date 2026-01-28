import styled from "styled-components";


export const Row = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: ${props => props.justify || 'start'};
    padding: ${props => props.padding};
    align-items: ${props => props.align || 'top'};
    margin: ${props => props.margin};
    width: ${props => props.width};
    height: ${props => props.height};
    background: ${props => props.background};
    color: ${props => props.color};
    position: ${props =>props.position /*?? 'relative'*/};
    user-select: ${props => props.userSelect || 'none'};

`;
export const Column = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: ${props => props.justify || 'start'};
    padding: ${props => props.padding};
    margin: ${props => props.margin};
    align-items: ${props => props.align || 'left'};
    width: ${props => props.width };
    height: ${props => props.height};
    background: ${props => props.background};
    color: ${props => props.color};
    position: ${props => props.position /*?? 'relative'*/};
    user-select: ${props => props.userSelect || 'none'};

`;

export const View = styled(Column)`   
`
