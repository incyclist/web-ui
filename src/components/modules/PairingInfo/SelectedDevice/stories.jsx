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

export const Failed = Template.bind({});
Failed.args = {
    capability:'heartrate',
    deviceName:'ANT+HR 123',
    value: '77',
    unit: 'bpm',
    connectState: 'failed' 
};
