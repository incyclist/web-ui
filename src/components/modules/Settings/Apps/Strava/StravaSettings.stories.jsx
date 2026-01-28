import React from 'react'
import styled from "styled-components";
import { StravaSettingsView } from "./StravaSettings";  
import { Row } from "../../../../atoms";

const View = styled(Row)`   
    width: 800px;
    height: 600px;
    overflow-y: hidden;    
`;


export default {
    component: StravaSettingsView,
    title: 'Modules/Settings/Strava',    
    argTypes: { 
        onConnect: { action: 'connect' } ,
        onDisconnect: { action: 'discconnect' } ,
        onBack: {action:'back'}
    },

};

const Template = args => <View className='TEST'> <StravaSettingsView {...args} /></View>

export const Default = Template.bind({});
Default.args = {    
    isConnected: false   
}

export const Connected = Template.bind({});
Connected.args = {    
    isConnected: true   
}
