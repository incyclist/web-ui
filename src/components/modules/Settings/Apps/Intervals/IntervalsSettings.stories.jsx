import React from 'react'
import styled from "styled-components";
import { IntervalsSettingsView } from "./IntervalsSettings";  
import { Row } from "../../../../atoms";

const View = styled(Row)`   
    width: 800px;
    height: 600px;
    overflow-y: hidden;    
`;


export default {
    component: IntervalsSettingsView,
    title: 'Modules/Settings/Intervals.icu',    
    argTypes: { 
        onConnect: { action: 'connect' } ,
        onDisconnect: { action: 'discconnect' } ,
        onBack: {action:'back'}
    },

};

const Template = args => <View className='TEST'> <IntervalsSettingsView {...args} /></View>

export const Default = Template.bind({});
Default.args = {    
    isConnected: false   
}

export const Connected = Template.bind({});
Connected.args = {    
    isConnected: true   
}