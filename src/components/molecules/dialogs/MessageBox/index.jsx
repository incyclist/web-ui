import React from 'react'
import styled from 'styled-components'
import { Dialog } from '../../Dialog'
import { Button, ButtonBar } from '../../../atoms'

const Text = styled.div`
    textAlign:'left',
    

`
const Header = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: center;
    width: 100%;
    height: 3vh;
    text-align: center;
    vertical-align: middle;
    background-color: SlateBlue;
`

const HeaderText = styled.span`
    color: white;
    text-align:center;
    vertical-align: middle;
`

const Body = styled.div`
    display: flex;
    flex-direction: column;
    margin:auto;
    padding: 0.5vh 0.5vw 0.5vw 0.5vw;    
    top:0;
    left:0;
    height: calc(100% - 10.7vh);
    background: ${props => props.theme.title.background??props.background?? 'white'};
    justify-content:${props => props.$verticallyCentered ? 'center' : undefined};
    text-align: ${props => props.$horizontallyCentered ? 'center' : 'left'};

`;

export const MessageBox = (props) => {

    const { yes='Yes', no='No', defaultButton='Yes', text, children, width, height='25vh',level=12, onYes , onNo, title, noYes, noNo, center} = props

    const onOKHandler = () => {
        if (onYes)
            onYes()
    }

    const onCancelHandler = () => {
        if (onNo)
            onNo()
    }

    return( 
        <Dialog width={width} height={height} level={level} onESC={onCancelHandler}>
            <Header className='message-header'>
                <HeaderText>{title}</HeaderText>
            </Header>

            <Body className='message-body' 
                $verticallyCentered={children===undefined || center }
                $horizontallyCentered={children===undefined && center }>
                {text? <Text>{text}</Text> : null}
                {children}
            </Body>

            <ButtonBar className='message-buttons' justify='center' background='white'>
                
                    {noYes ? null : <Button text={yes} default={defaultButton===yes} onClick={onOKHandler}/>}
                    {noNo  ? null : <Button text={no} default={defaultButton===no} onClick={onCancelHandler}/>}
                
            </ButtonBar>
        </Dialog>
    )
}

