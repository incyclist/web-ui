import React from 'react';
import { PairingScreen } from './screen';

export default {
    component: PairingScreen,
    title: 'Pages/Pairing',
  };

const Template = args => <PairingScreen {...args} />;

const interfaces = [
    {name:'ant', enabled:true, state:'connected', isScanning:true},
    {name:'ble', enabled:true, state:'idle'},
    {name:'serial', enabled:true, state:'idle'},
    {name:'tcpip',enabled:false, state:'disabled'},
]

const rowLabels = {
    top: { text:'TO RIDE', subtext:'connect any one' },
    bottom: { text:'OPTIONAL', subtext:'extras, not needed' },
}

const tile = (overrides) => ({
    title: overrides.title,
    capability: overrides.capability,
    role: overrides.role ?? 'required',
    helpText: { full: overrides.helpText ?? '', short: overrides.helpText ?? '' },
    emptyFooter: overrides.emptyFooter,
    ...overrides,
})

const paired = {
    top: [
        tile({ title:'Resistance', capability:'control', deviceName:'Volt', connectState:'connecting' }),
        tile({ title:'Power', capability:'power', deviceName:'Ant+ PWR 2606', connectState:'connected', unit:'W', value:25 }),
        tile({ title:'Speed', capability:'speed', emptyFooter:'Searching...' }),
    ],
    bottom: [
        tile({ title:'Heartrate', capability:'heartrate', deviceName:'Ant+ HR 2630', connectState:'connected', unit:'bpm', value:65, role:'optional' }),
        tile({ title:'Cadence', capability:'cadence', emptyFooter:'Optional', role:'optional' }),
        tile({ title:'Controller', capability:'app_control', connectState:'failed', deviceName:'Zwift Play', role:'optional' }),
    ],
    rowLabels,
}

export const PairReady = Template.bind({});
PairReady.args = {
    capabilities: paired,
    interfaces,
    readyToStart:true,
    status: { id:'S2', dot:'green', text:'Ready to ride' },
    buttons: [ { label:'OK', primary:true } ],
};

export const PairNotReady = Template.bind({});
PairNotReady.args = {
    capabilities: paired,
    interfaces,
    status: { id:'S3', dot:'amber', text:'Connect a trainer, power or speed sensor' },
    buttons: [ { label:'Simulate', primary:true }, { label:'Skip', primary:false } ],
};

export const StartReady = Template.bind({});
StartReady.args = {
    capabilities: paired,
    interfaces,
    readyToStart:true,
    status: { id:'S2', dot:'green', text:'Ready to ride' },
    buttons: [ { label:'Start', primary:true } ],
};

export const StartNotReady = Template.bind({});
StartNotReady.args = {
    capabilities: paired,
    interfaces,
    status: { id:'S3', dot:'amber', text:'Connect a trainer, power or speed sensor' },
    buttons: [ { label:'Simulate', primary:true }, { label:'Cancel', primary:false } ],
};

export const NoneSearching = Template.bind({});
NoneSearching.args = {
    capabilities: paired,
    interfaces: interfaces.map(i => ({...i, enabled:false})),
    status: { id:'S1', dot:'red', text:'No interfaces enabled - enable ANT+ or Bluetooth' },
    buttons: [ { label:'Simulate', primary:true }, { label:'Skip', primary:false } ],
};
