import React  from 'react'
import { Card } from '../base/Card'
import { ButtonContainer, Container, DataContainer, ImageContainer,Title } from '../base/atoms'
import { Button, Center, Column,  Icon,  Row, Text } from '../../../atoms'
import Loader from 'react-spinners/ClipLoader'
import styled from 'styled-components'
import { TrashIcon } from '@primer/octicons-react'
import { copyPropsExcluding } from '../../../../utils/props'

export const ActiveImportCard = (props) => {
    return <Card {...props}   Summary={ActiveImportSummary} />
}

export const ErrorContainer = styled(Column)`
  background: white;
  width: calc(100% - 20px);
  height: calc(100% - 20px);
  min-height: calc(100% - 20px);
  margin: 10px;

`

export const ErrorView = styled(Row) `
  color: red;
  font-size: 1.5vh;
  text-align: left;
`

export const File = styled(Title)`
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    font-size: 1.8vh;
`

const Trash = (props)=> {
    let clientProps = {}
    try {
        clientProps = copyPropsExcluding(['size','width','height'])
    }
    catch (err){
        console.log('~~~ ERROR',err)
    }
    return <TrashIcon {...clientProps} size={20} />
} 


export const ActiveImportSummary = ( { name, error,observer,
    width='20vw',height='30vh',onRetry,onDelete }) => {

    const state= {name,error}

    return (
    <Container width={width} height={height} >

        <ImageContainer className='images'>
            {state.error ? 
                <ErrorContainer>
                    <Text color='red' bold={true}>Error</Text>
                    <ErrorView>{state.error.message}</ErrorView>
                </ErrorContainer>
                :
                <Center position='relative'><Loader/></Center>
            }
        </ImageContainer>


        <DataContainer  className='data'>
            <Row> 
                <Column width='80%'> <File bold={true} >{state.name} </File></Column>                                                 
            </Row>
        </DataContainer>

        <ButtonContainer  className='buttons'>
            { error ?  <Button text='Retry' logInfo={name} onClick={onRetry} /> : null}
            { error? <Icon height={20} margin={0} padding={0} onClick={onDelete}><Trash/></Icon>:null}
        </ButtonContainer>


    </Container>
    )
}
