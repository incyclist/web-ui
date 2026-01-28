import React from 'react';
import styled from 'styled-components';
import { Setting } from './Setting'
import { Label } from './Label';


const PropertyValue = styled.div`
    font-size: 1.5vh;
    display: flex;
    flex-direction: row;
    text-align: left;
    vertical-align: middle;    
    justify-content: left;
    min-height: 3vh;
    max-height: 3vh;

`

const Description = styled.div`
    font-size: 1vh;
    display: flex;
    flex-direction: column;
    min-height: 3vh;
    max-height: 3vh;
    justify-content: center;
    text-align: left;

`

export const Property = (props) => {
    const {property, settings} = props
    if (property.condition && property.condition(settings)===false) 
        return null;

    return (
        
        <PropertyValue>
            <Label>{property.name}</Label>
            <div style={{width:'20%'}}><Setting {...props}/></div>
            <Description>{property.description}</Description>
        </PropertyValue>
        
        
    )

}