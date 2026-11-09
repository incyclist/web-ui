import React from 'react';
import {SelectedDevice} from './index';

export default {
  component: SelectedDevice,
  title: 'Modules/Pairing/Selected Device',
  argTypes: { onDrop: { action: 'dropped' } },
};

const Template = args => <SelectedDevice {...args} />;


export const Default = Template.bind({});
Default.args = {
    capability:'heartrate',
    deviceName:'ANT+HR 123',
    value: '77',
    unit: 'bpm',
    connectState: 'connected' 
};

export const LongText = Template.bind({});
LongText.args = {
    capability:'heartrate',
    deviceName:'ANT+HR 123456789',
    value: '77',
    unit: 'bpm',
    connectState: 'connected' 
};

// the trainer is kept but not used while the ride falls back to a power meter; a click takes it back
export const DimmedTrainer = Template.bind({});
DimmedTrainer.args = {
    title: 'Resistance',
    capability: 'control',
    deviceName: 'Tacx Flux',
    connectState: 'failed',
    trainerRole: 'trainer',
    roleLabel: 'Your trainer',
    footerText: 'Tap to use again',
    dimmed: true,
};

// another tile the excluded trainer still fills
export const DimmedViaTrainer = Template.bind({});
DimmedViaTrainer.args = {
    title: 'Speed',
    capability: 'speed',
    deviceName: 'Tacx Flux',
    connectState: 'failed',
    footerText: 'Not used',
    dimmed: true,
};

export const Failed = Template.bind({});
Failed.args = {
    capability:'heartrate',
    deviceName:'ANT+HR 123',
    value: '77',
    unit: 'bpm',
    connectState: 'failed' 
};
