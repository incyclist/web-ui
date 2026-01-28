import React from 'react';
import Flag from 'react-world-flags';
import { Title, DistanceText, ElevationText, DataContainer } from '../base/atoms';
import { Row, Column, Image } from "../../../atoms";
import styled from 'styled-components';

const ElevationRow = styled(Row)`
    position:absolute;
    bottom:10px;
    left:0;
    width: 100%;
`

export const RouteInfo = ({ title, country, distance, elevation,totalDistance, totalElevation, width, height,summary }) => {

    const buildDistanceText = () => {
        try {
        
            if (totalDistance?.value && !Number.isNaN(totalDistance?.value)) 
                return `${totalDistance.value}${totalDistance.unit}`
            else if (distance && !Number.isNaN(distance)) 
                return `${(distance / 1000).toFixed(1)}km ` 
            return ''
        }
        catch {
            return ''
        }
    }

    const buildElevationText = () => {
        try {
            if (totalElevation?.value && !Number.isNaN(totalElevation?.value)) 
                return `${totalElevation.value}${totalElevation.unit}`
            else if ( elevation && !Number.isNaN(elevation)) 
                return `${(elevation).toFixed(0)}m `
            return '' 
        }
        catch {
            return ''
        }
    }

    const distanceText = buildDistanceText()

    const elevationText = buildElevationText()

    const ElevationInfo = summary ? ElevationRow : Row
    return (
        <DataContainer width={width} height={height}>
            <Row> 
                <Column width='80%'> <Title bold={true}>{title} </Title></Column>
                <Column width='20%' justify='center' background='none'> <Flag height={height / 20} code={country} /></Column>
            </Row>

            <ElevationInfo>
                <Column width='50%' align='center'>
                    <Row><Image src='images/length.gif' color='white' width='20px' />    </Row>
                    <Row><DistanceText width='50%' align='center'>{distanceText}</DistanceText></Row>
                </Column>

                <Column width='50%' align='center'>

                    <Row><Image src='images/up.gif' color='white' width='20px' /></Row>
                    <Row><ElevationText width='50%' align='center'>{elevationText}</ElevationText></Row>
                </Column>

            </ElevationInfo>
        </DataContainer>
    );
};
