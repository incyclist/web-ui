import React from 'react';
import styled from 'styled-components';

const Container = styled.div`    
    color: white;
    font-size: ${props=>props.size ? props.size :'3vh'};
    text-transform: ${props=> props.caps ? 'uppercase' : undefined};
    font-weight: ${props=>props.bold? 'bold': 'normal'};
    width:100%;
    height: calc( ${props=>props.size} + 1vh );
    display: flex;
    position: relative;
    justify-content: start;
    align-items: left;
    text-align: left;
    vertical-align: middle;
`

export const GroupTitle =({size,bold=true,children}) => <Container bold={bold} size={size}>{children}</Container>
