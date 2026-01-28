import React from 'react';
import { Container, ImageContainer, ButtonContainer } from '../base/atoms';
import { RouteInfo } from './RouteInfo';
import { Button, Row, Image } from '../../../atoms';
import { DataContainer } from './atoms';


const DEFAULT_TITLE = 'Free Ride'

export const FreeRideSummary = ( { id, title=DEFAULT_TITLE,lat,lng,ready,visible,
                                width='20vw',height='30vh',onOK }) => {

    
    const routeProps = {title, width, height}

    const renderImage = true; // ready && visible 

    /*
    if (!ready ||!visible) {
    return <Container width={width} height={height}>
                <Loader />
            </Container> 
    }
    */

    const onMoreInfo =()=> {}

    return (
        <Container width={width} height={height} >
            
            <ImageContainer>
                {renderImage ? <Image width='100%' height='100%' src='images/free-ride.jpg'/>
                : null}

            </ImageContainer>

            <RouteInfo {...routeProps}/>

            <DataContainer>
                <Row height='2vh'/>
                <Row/>
            </DataContainer>
            <ButtonContainer>
                <Button text='OK' logInfo={ title} onClick={onOK} />
                <Button hidden={true} text='More Info' secondary={true} textColor='white '  logInfo={ title} onClick={onMoreInfo}/>

            </ButtonContainer>

            
        </Container>
    )
}