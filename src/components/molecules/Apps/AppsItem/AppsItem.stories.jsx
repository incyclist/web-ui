import React from 'react'
import { AppsItem } from "./AppsItem";

export default {
    component: AppsItem,
    title: 'Molecules/Apps/AppsItem',    
    argTypes: { 
        onClick: { action: 'click' } ,
    },
  };
const Template = args => <AppsItem {...args} />




export const Strava = Template.bind({});
Strava.args = {    
    name:'Strava',
    key:'strava',
    iconUrl: 'https://static.cdnlogo.com/logos/s/42/strava-wordmark.svg'

}

export const Velo = Template.bind({});
Velo.args = {    
    name:'VeloHero',
    key:'velohero',
    iconUrl: 'images/velo-white.png'

}

export const Komoot = Template.bind({});
Komoot.args = {    
    name:'Komoot',
    key:'komoot',
    iconUrl: 'https://www.komoot.com/assets/4d8ae313eec53e6e.svg'

}