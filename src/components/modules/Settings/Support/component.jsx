import React, { useState } from "react"
import { Text, Row, UrlLink, Column, Button } from "../../../atoms"
import styled from "styled-components"

const View = styled(Column)`
    padding-left: 1vw;
    padding-right: 1vw;
    padding-top: 1vh;
    padding-bottom: 1vh;
    padding:1vw;
`

const Disclaimer = styled(Row)`
    color:grey;
`

const Header = styled.h2`
    font-size: 2vh;
`


export const SupportAreaView = ({uuid, reactVersion, appVersion}) => {
    
    const [copied,setCopied] = useState(false)

    const textProps = {
        labelWidth:'10vw'
    }

    const copyUUID = ()=>{
        try {
            navigator.clipboard.writeText(uuid);
            setCopied(true)
        }
        catch{}
    }
    return (
        <View className='support'>
            <Header><b>App Info</b></Header>
            <Text label='App Version' {...textProps}>{appVersion}</Text>
            <Text label='UI Version' {...textProps}>{reactVersion}</Text>
            <Row>
                <Text label='uuid' {...textProps}>{uuid}</Text> 
                {!copied ? <Button width='6ch' height='2vh' fontSize='1.5vh' secondary={true} padding='0' margin='0 0 0 0.5vw' onClick={copyUUID}>Copy</Button>: null}
            </Row>
            <Text label='Privacy' {...textProps}><UrlLink text='Privacy Statement' url='https://incyclist.com/privacy'/> </Text>
            
            <br/>
            <Header><b>Where can I get support?</b></Header>
            <Text label='Slack' {...textProps}><UrlLink text='Incyclist Slack Workspace' url='https://join.slack.com/t/incyclist/shared_invite/zt-119wcvtjn-uiZ_Pw6gh5WLc0zT8jkfTg'/> </Text>
            <Text label='Strava' {...textProps}><UrlLink text='Incyclist Strava Club' url='https://www.strava.com/clubs/1029407'/> </Text>
            <Text label='Email' {...textProps}><UrlLink text='support@incyclist.com' url='mailto:support@incyclist.com'/> </Text>
            
            <br/>
            <Header bold={true}><b>How can I support?</b></Header>
            <Text label='Coding' {...textProps}>Incyclist is open source. You can contribute to the development in my <UrlLink text='GitHub' url='https://github.com/incyclist'/> </Text>
            <Text label='Donation' {...textProps}>You can donate any amount to <UrlLink text='Incyclist Paypal' url='https://www.paypal.com/paypalme/incyclist'/> </Text>
            <Disclaimer>                
                <Text>
                    Donation is 100% voluntarily. In case you donate, you will not have any benefit within the App. I.e. Incyclist remains to be a 100% free app, regardless if you donate or not. 
                    I am also <b>not</b> planning to introduce a freemium model, where certain functionality is only available for paying users.
                </Text>

            </Disclaimer>
                    
        </View>
    )

}