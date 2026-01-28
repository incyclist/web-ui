import React from "react";
import styled from "styled-components";

const Container = styled.div`
    height: ${props => props.height || '100%'};
    width: ${props => props.width || '100%'};
    background-color: "#e0e0de";
    border-radius: 50;
    margin: 50;
`

const Filler = styled.div`
    height: '100%';
    width: ${props => props.completed!==undefined ? `${props.completed}%` : 0};
    background-color: ${props => props.color || 'lightgrey'};
    border-radius: 'inherit';
    text-align: 'right';
`

const Label = styled.span`
    padding: 5px;
    color: ${props => props.color || 'white'};
    font-weight: bold;
`


export const ProgressBar = ({ color, completed,height,width,textColor,text }) => {

    return (
      <Container height={height} width={width}>
        <Filler completed={completed} color={color}>
          <Label color={textColor}>{ text || `${completed}%`}</Label>
        </Filler>
      </Container>
    );  
};

