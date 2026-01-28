import React from 'react';
import { TrashIcon } from '@primer/octicons-react';
import { AppThemeProvider } from '../../../../../theme';
import { copyPropsExcluding } from '../../../../../utils/props';
import { Button, Column, Icon, Loader, Row } from '../../../../atoms';
import { WorkoutGraph } from '../../../../molecules';
import { Container, DataContainer, DurationLabel, DurationText, ImageContainer,Title,
         ButtonContainer,LoaderContainer } from '../base/atoms';
import styled from 'styled-components'

const Trash = (props)=> {
    const childProps = copyPropsExcluding(props,['size','width','height'])
    return <TrashIcon {...childProps} size={20} />
} 

const OutsideFold = styled.div`
    opacity: 0.1;
    z-index: 0;
    display: flex;
    position: relative;
    flex-direction: column;
    height: ${props => `${props.height}px`};
    width: ${props => `${props.width}px`};
    user-select: none;

    padding: 0;
    margin: 0;

`

export const WorkoutSummary = ( props) => {
  
    const { visible,title=props?.workout?.title,workout,ftp=200,duration,selected, canDelete=true,
            width='20vw',height='30vh',onOK,onDelete,onUnselect} = props
    
    const showDuration = duration!==undefined && duration!==null && typeof(duration)==='string'
    const titleStr = title!==undefined && title!==null && typeof(title)==='string' ? title : ''

    if (!visible) {
        return (
        <OutsideFold className='workout-card' width={width} height={height} >
            
        </OutsideFold>
        )
    }

    return (
        <AppThemeProvider>
        <Container width={width} height={height} hidden={!visible} selected={selected} className='workout-card'>
            <ImageContainer>
                { workout?
                        <Row width='100%' height='100%'>
                            <WorkoutGraph  workout={workout}  dashboard ftp={ftp}/>
                        </Row>
                    :null}
                {workout ? null: <LoaderContainer><Loader/></LoaderContainer>}
            </ImageContainer>

            <DataContainer className='data'>
                <Row> 
                    <Column width='80%'><Title bold={true}>{titleStr}</Title></Column>                
                </Row>
                <Row> 
                    {showDuration ? 
                    <Column>
                        <DurationLabel>Duration</DurationLabel>
                        <DurationText>{duration}</DurationText>
                    </Column>
                    :null}
                </Row>

            </DataContainer>


            <ButtonContainer>
                {selected ? 
                    <Button text='Unselect' disabled={!workout} logContext={ {title}} onClick={onUnselect}/> :
                    <Button text='OK' disabled={!workout} logContext={ {title}} onClick={onOK} /> 
                }
                {canDelete?<Icon height={20} margin={0} padding={0} id={'delete'} onClick={onDelete}><Trash/></Icon>:null}
            </ButtonContainer>

        </Container>    
        </AppThemeProvider>
    )
}

