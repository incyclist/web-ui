import React from 'react';
import { Container, ImageContainer, ButtonContainer, DataContainer, Title } from '../base/atoms';
import { Button,Column,Image,Row} from '../../../../atoms';

const DEFAULT_TITLE = 'Create Workout'

export const CreateSummary = ( { id, title=DEFAULT_TITLE, width='20vw',height='30vh',onOK }) => {



    return (
        <Container width={width} height={height} >
            
            <ImageContainer>
                <Row align='center' justify='center' background='white' height='100%'>
                        <Image width='80%'  src='images/zwofactory.svg'/>
                   
                </Row>
            </ImageContainer>


            <DataContainer width={width} height={height}>
                <Row> 
                    <Column width='80%'> <Title bold={true}>{title} </Title></Column>                    
                </Row>

            </DataContainer>

            <ButtonContainer>                
                <Button text='OK' disabled={false} logContext={ {title}} onClick={onOK} /> 
            </ButtonContainer>

            
        </Container>
    )
}