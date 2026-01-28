import React from 'react';
import { DeviceSelector } from './component';

export default {
    component: DeviceSelector,
    title: 'Modules/Pairing/Device Selector',   
    argTypes: { 
        onOK: { action: 'OK' },
        onCancel: {action: 'Cancel'},
        onDelete: {action: 'Delete'},
        onAll: {action:'For All'}
    },
  };
  
const Template = args => <DeviceSelector {...args} />;

export const Default = Template.bind({});
Default.args = {
    capability: 'Power',
    pairingState: 'none',
    devices: [
        { udid:'1', name:'ANT+FE 1234', connectState:'connected',value:100, unit:'W' },
        { udid:'2', name:'Tacx 2222', connectState:'connecting', selected:true },
        { udid:'3', name:'ANT+FE 1234', connectState:'failed' }

    ]
};

export const WithForAll = Template.bind({});
WithForAll.args = {
    capability: 'Power',
    pairingState: 'none',
    devices: [
        { udid:'1', name:'ANT+FE 1234', connectState:'connected',value:100, unit:'W' },
        { udid:'2', name:'Tacx 2222', connectState:'connecting', selected:true },
        { udid:'3', name:'ANT+FE 1234', connectState:'failed' }

    ],
    canSelectAll:true
    
};