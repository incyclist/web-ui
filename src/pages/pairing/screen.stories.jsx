import React from 'react';
import { PairingScreen } from './screen';
import { clone } from '../../utils/coding';

export default {
    component: PairingScreen,
    title: 'Pages/Pairing',   
    argTypes: { 
        onOK: { action: 'OK' },
        onInterfaceClick: {action: 'Interface Clicked'},
        onCapabilityClick: {action: 'Capability Clicked'}
    },
  };
  
const Template = args => <PairingScreen {...args} />;

const interfaces = [ 
    {name:'Ant', enabled:true},
    {name:'BLE', enabled:true},
    {name:'serial', enabled:true},
    {name:'TCPIP',enabled:false},
]

const capabilities = [
    {capability:'Control', deviceName:'Volt', connectState:'connecting' },
    {capability:'Power', deviceName:'Ant+ PWR 2606', connectState:'connected', unit:'W', value:25 },
    {capability:'Heartrate', deviceName:'Ant+ HR 2630', connectState:'connected', unit:'bpm', value:65 },
    {capability:'Speed', deviceName:'Ant+ SC 111', connectState:'failed' }
]

export const PairReady = Template.bind({});
PairReady.args = {
    capabilities,
    interfaces,
    readyToStart:true,
};


export const pairNotReady = Template.bind({});
pairNotReady.args = {
    capabilities,
    interfaces
};

export const StartReady = Template.bind({});
StartReady.args = {
    capabilities,
    interfaces,
    showSimulate:true,
    readyToStart:true,
    labelOK: 'Start',
    labelSkip: 'Cancel'
};

export const StartNotReady = Template.bind({});
StartNotReady.args = {
    capabilities,
    interfaces,
    showSimulate:true,
    labelOK: 'Start',
    labelSkip: 'Cancel'
};

export const ValueIs0 = Template.bind({});
const caps = clone(capabilities)
caps.forEach(c => { if(c.unit) c.value=0})
ValueIs0.args = {
    capabilities:caps,
    interfaces,
    readyToStart:true,
};
