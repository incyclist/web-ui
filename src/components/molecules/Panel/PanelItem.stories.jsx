import React from 'react';
import {PanelItem} from './PanelItem';

export default {
    component: PanelItem,
    title: 'molecules/PanelItem',
    
  };
const Template = args =>  <PanelItem {...args} />

export const Default = Template.bind({});
Default.args = {
    width: '10vw',
    rows:1,
    showHeader:true,
    title:'Speed', 
    data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}]
   
}


export const Red = Template.bind({});
Red.args = {
    width: '10vw',
    rows:1,
    showHeader:true,
    title:'Speed', 
    data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}],
    dataState:'red'
   
}

export const Amber = Template.bind({});
Amber.args = {
    width: '10vw',
    rows:1,
    showHeader:true,
    title:'Speed', 
    data:[{value:'31.2',unit:'km/h'},{value:'55.0', label:'max'}],
    dataState:'amber'
   
}

