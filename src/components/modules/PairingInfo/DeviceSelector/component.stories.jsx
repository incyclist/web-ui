import React from 'react';
import { DeviceSelector } from './component';
import { conflictFromPick } from '../ConflictStepDialog/ConflictStepDialog.mock';

export default {
    component: DeviceSelector,
    title: 'Modules/Pairing/Device Selector',
    argTypes: {
        onOK: { action: 'OK' },
        onCancel: {action: 'Cancel'},
        onDelete: {action: 'Delete'},
    },
  };

const Template = args => <DeviceSelector {...args} />;

const devices = [
    { udid:'1', name:'ANT+FE 1234', connectState:'connected',value:100, unit:'W' },
    { udid:'2', name:'Tacx 2222', connectState:'connecting', selected:true },
    { udid:'3', name:'ANT+FE 1234', connectState:'failed' }
]

export const Default = Template.bind({});
Default.args = {
    capability: 'Power',
    devices,
};

// after a pick in the Resistance list that would take a slot held by another device
export const ConflictStep = Template.bind({});
ConflictStep.args = {
    capability: 'control',
    devices,
    conflictStep: conflictFromPick(),
};
