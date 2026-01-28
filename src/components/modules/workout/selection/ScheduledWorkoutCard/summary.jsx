import React from 'react';
import { AppThemeProvider } from '../../../../../theme';
import { Button, Column, Loader, Row } from '../../../../atoms';
import { WorkoutGraph } from '../../../../molecules';
import { Container, DataContainer, DurationLabel, DurationText, ImageContainer,Title,
         ButtonContainer,LoaderContainer } from '../base/atoms';

export const ScheduledWorkoutSummary = ( props) => {
  
    const { visible,title=props?.workout?.title,workout,ftp=200,duration,selected, date,
            width='20vw',height='30vh',onOK,onUnselect} = props
    
    const showDuration = duration!==undefined && duration!==null && typeof(duration)==='string'
    const titleStr = title!==undefined && title!==null && typeof(title)==='string' ? title : ''

    const showDate = !!date
    const dateStr = showDate ? date.toLocaleDateString() : ''

    return (
        <AppThemeProvider>
        <Container width={width} height={height} hidden={!visible} selected={selected} className='workout-card'>
            
            <ImageContainer>
                { workout?
                        <Row width='100%' height='100%'>
                            <WorkoutGraph  workout={workout}  dashboard ftp={ftp}/>
                        </Row>
                    :null}
                {!workout ? <LoaderContainer><Loader/></LoaderContainer>: null}
            </ImageContainer>

            <DataContainer className='data'>
                <Row> 
                    <Column width='80%'><Title bold={true}>{titleStr}</Title></Column>                
                </Row>
                <Row> 
                    {showDuration ? 
                    <Column width='50%'>
                        <DurationLabel>Duration</DurationLabel>
                        <DurationText>{duration}</DurationText>
                    </Column>
                    :<Column width='50%'>
                        &nbsp;
                    </Column>
                    }

                    {showDate ? 
                    <Column width='50%'>
                        <DurationLabel>Date</DurationLabel>
                        <DurationText>{dateStr}</DurationText>
                    </Column>
                    :
                    <Column width='50%'>
                        &nbsp;
                    </Column>
                    }

                </Row>

            </DataContainer>


            <ButtonContainer>
                {selected ? 
                    <Button text='Unselect' disabled={!workout} logContext={ {title}} onClick={onUnselect}/> :
                    <Button text='OK' disabled={!workout} logContext={ {title}} onClick={onOK} /> 
                }                
            </ButtonContainer>

        </Container>    
        </AppThemeProvider>
    )
}

