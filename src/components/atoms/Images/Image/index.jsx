import styled from "styled-components";

export const Image = styled.img`
    width: ${props => props.width};
    height: ${props => props.height};
    
    color: ${props => props.color};
    user-select: none;
    pointer-events: none;
    max-width: ${props => props.circle ? '80%' : undefined};
    max-height: ${props => props.circle ? '80%' : undefined};
    border-radius: ${props=>props.circle ? '50%' :'0%'};

`