import React from 'react';
import { Container, ImageContainer, ButtonContainer, DataContainer, Title } from '../base/atoms';
import { Button,Column,Row} from '../../../../atoms';
import styled from 'styled-components';
import { Dropzone } from '../../../../molecules';

const DEFAULT_TITLE = 'Import Workout'
const DEFAULT_FILTERS = [
    { name: 'Workouts', extensions: ['zwo'] }
]                             


const FileDrop = styled(Dropzone)`
    color: white;
    margin:10px;
`

export const UploadSummary = ( { id, title=DEFAULT_TITLE, filters=DEFAULT_FILTERS, ready,visible,
                                width='20vw',height='30vh',onMoreInfo,onOK }) => {


    const onDrop = async (...args)=>{
        if (onOK) {
            await onOK(...args)
            return null;
        }
        return null;
    }

    

    return (
        <Container width={width} height={height} >
            
            <ImageContainer>
                <FileDrop height='90%' filters={filters} onDrop={onDrop}>
                   
                </FileDrop>

            </ImageContainer>


            <DataContainer width={width} height={height}>
                <Row> 
                    <Column width='80%'> <Title bold={true}>{title} </Title></Column>                    
                </Row>

            </DataContainer>

            <ButtonContainer>
                <Button hidden={true} text='More Info' secondary={true} textColor='white '  logInfo={ title} onClick={onMoreInfo}/>
                    
                
            </ButtonContainer>

            
        </Container>
    )
}