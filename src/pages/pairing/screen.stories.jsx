import React from 'react';
import { PairingScreen } from './screen';
import { helperNoTrainer, helperTrainerUnavailable } from '../../components/modules/PairingInfo/PairingHelperPanel/PairingHelperPanel.mock';

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
    emptyFooter: overrides.emptyFooter,
    ...overrides,
    helpText: { full: overrides.helpText ?? '', short: overrides.helpText ?? '' },
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
    status: { id:'S1', dot:'red', text:"Can't search: Bluetooth and ANT+ are both unavailable.", link:'Check connections' },
    helper: { ...helperNoTrainer(), phase:'hidden' },
    buttons: [ { label:'Simulate', primary:true }, { label:'Skip', primary:false } ],
};

const searchingRows = {
    top: [
        tile({ title:'Resistance', capability:'control', helpText:'Smart trainer', emptyFooter:'Searching…', awaited:true }),
        tile({ title:'Power', capability:'power', helpText:'Power meter', emptyFooter:'Searching…', awaited:true }),
        tile({ title:'Speed', capability:'speed', helpText:'Speed sensor', emptyFooter:'Searching…', awaited:true }),
    ],
    bottom: [
        tile({ title:'Heartrate', capability:'heartrate', deviceName:'Ant+ HR 2630', connectState:'connected', unit:'bpm', value:65, role:'optional' }),
        tile({ title:'Cadence', capability:'cadence', helpText:'Cadence sensor', emptyFooter:'Optional', role:'optional' }),
        tile({ title:'Controller', capability:'app_control', helpText:'Remote buttons, e.g. Zwift Play', emptyFooter:'Optional', role:'optional' }),
    ],
    rowLabels,
}

const stillSearching = { id:'S6', dot:'amber', text:'Still searching…', link:"Can't find your trainer?" }

export const HelperOpenNoTrainer = Template.bind({});
HelperOpenNoTrainer.args = {
    capabilities: searchingRows,
    interfaces,
    status: stillSearching,
    helper: helperNoTrainer('asleep'),
    buttons: [ { label:'Skip', primary:true } ],
};

export const HelperOpenNoDevice = Template.bind({});
HelperOpenNoDevice.args = {
    capabilities: searchingRows,
    interfaces,
    status: stillSearching,
    helper: helperNoTrainer('no_device'),
    buttons: [ { label:'Skip', primary:true } ],
};

const viaTrainer = (title, capability, footer, extra={}) => tile({
    title, capability, deviceName:'Tacx Flux', connectState:'failed', trainerRole:'via-trainer', roleLabel:'via your trainer',
    footerText: footer, ...extra,
})

const trainerUnreachableRows = (picked) => ({
    top: [
        tile({ title:'Resistance', capability:'control', deviceName:'Tacx Flux', connectState:'failed', trainerRole:'trainer', roleLabel:'Your trainer',
            footerText:{ full:'Not connected · waiting', short:'Waiting…' }, awaited:true }),
        viaTrainer('Power', 'power', picked ? { full:'Tap to add', short:'Tap to add' } : { full:'Waiting for trainer', short:'Via trainer' }, { awaited:picked }),
        viaTrainer('Speed', 'speed', picked ? { full:'Tap to add', short:'Tap to add' } : { full:'Waiting for trainer', short:'Via trainer' }, { awaited:picked }),
    ],
    bottom: [
        tile({ title:'Heartrate', capability:'heartrate', helpText:'Heart-rate monitor', emptyFooter:'Optional', role:'optional' }),
        viaTrainer('Cadence', 'cadence', { full:'Waiting for trainer', short:'Via trainer' }, { role:'optional' }),
        tile({ title:'Controller', capability:'app_control', helpText:'Remote buttons, e.g. Zwift Play', emptyFooter:'Optional', role:'optional' }),
    ],
    rowLabels: { ...rowLabels, top: { text:'TO RIDE', subtext:'waiting for your trainer' } },
})

const trainerUnreachable = { id:'S7', dot:'amber', text:"Can't reach your trainer Tacx Flux. Pedal a few strokes to wake it up.", link:'Not available today?' }

export const TrainerUnreachable = Template.bind({});
TrainerUnreachable.args = {
    capabilities: trainerUnreachableRows(false),
    interfaces,
    status: trainerUnreachable,
    helper: { ...helperTrainerUnavailable(), phase:'hidden' },
    buttons: [ { label:'Skip', primary:true } ],
};

export const TrainerUnreachableHelperOpen = Template.bind({});
TrainerUnreachableHelperOpen.args = {
    capabilities: trainerUnreachableRows(true),
    interfaces,
    status: trainerUnreachable,
    helper: helperTrainerUnavailable('trainer_unavailable'),
    buttons: [ { label:'Skip', primary:true } ],
};
