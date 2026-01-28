import styled from "styled-components";
import { Row } from "../../../atoms";
import { AppsSettingsView } from "./AppsSettings";
import React from 'react'

const View = styled(Row)`   
    width: 800px;
    height: 600px;
    overflow-y: hidden;
`;


export default {
    component: AppsSettingsView,
    title: 'Modules/Settings/AppsSettings',    
    argTypes: { 
        onClick: { action: 'select' } ,
    },

};

const Template = args => <View className='TEST'> <AppsSettingsView {...args} /></View>

export const Default = Template.bind({});
Default.args = {    
    apps: [
        { name:'Strava', key:'strava', iconUrl: 'https://static.cdnlogo.com/logos/s/42/strava-wordmark.svg' },
        { name:'VeloHero', key:'velohero', iconUrl: 'images/velo-white.png' },
        { name:'Komoot', key:'komoot', iconUrl:'https://www.komoot.com/assets/4d8ae313eec53e6e.svg' },
    ]
}


