import React from 'react'
import styled from 'styled-components'
import { Dialog } from '../../../molecules/Dialog'
import { Button, ButtonBar } from '../../../atoms'

const Header = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 3vh;
    text-align: center;
    background-color: SlateBlue;
`

const HeaderText = styled.span`
    color: white;
`

const Body = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0.5vh 0.5vw;
    height: calc(100% - 11.7vh);
    background: ${props => props.theme?.title?.background ?? 'white'};
    text-align: left;
`

/** Pure view: "You have <title> scheduled today - do you want to start it?" with No / Check workouts / Yes */
export const ScheduledWorkoutPromptView = ({ title, onYes, onNo, onCheckWorkouts }) => {
    return (
        <Dialog id='ScheduledWorkoutPrompt' width='40vw' height='25vh' level={12} onESC={onNo}>
            <Header className='message-header'>
                <HeaderText>Scheduled Workout</HeaderText>
            </Header>

            <Body className='message-body'>
                <div>You have <b>{title}</b> scheduled today - do you want to start it?</div>
            </Body>

            <ButtonBar className='message-buttons' justify='center' background='white'>
                <Button text='Yes' primary autoFocus onClick={onYes} />
                <Button text='Check workouts' onClick={onCheckWorkouts} />
                <Button text='No' onClick={onNo} />
            </ButtonBar>
        </Dialog>
    )
}
