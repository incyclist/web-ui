import React from 'react';
import { Title, DistanceText, ElevationText  } from '../base/atoms';
import { DataContainer } from './atoms';
import { Row, Column, Image } from "../../../atoms";

export const RouteInfo = ({ title, width, height }) => {

    const distanceText = 'endless'

    const elevationText = 'none'


    return (
        <DataContainer width={width} height={height}>
            <Row> 
                <Column width='80%'> <Title bold={true}>{title} </Title></Column>
            </Row>

            <Row>
                <Column width='50%' align='center'>
                    <Row><Image src='images/length.gif' color='white' width='20px' />    </Row>
                    <Row><DistanceText width='50%' align='center'>{distanceText}</DistanceText></Row>
                </Column>

                <Column width='50%' align='center'>

                    <Row><Image src='images/up.gif' color='white' width='20px' /></Row>
                    <Row><ElevationText width='50%' align='center'>{elevationText}</ElevationText></Row>
                </Column>

            </Row>

        </DataContainer>
    );
};
