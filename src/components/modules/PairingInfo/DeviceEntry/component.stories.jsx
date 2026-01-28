import React from 'react';

import {DeviceEntryView as DeviceEntry} from './index';
import { Overlay } from '../../../atoms';

export default {
  component: DeviceEntry,
  title: 'Modules/Pairing/Device Entry',
  argTypes: { onDrop: { action: 'dropped' } },
};



const Template = args => <Overlay width="35vw" height="7vh" ><DeviceEntry {...args} /></Overlay>;



export const Default = Template.bind({});
Default.args = {
    name:'ANT+HR 123',
    value: '77',
    connectState: 'connected' ,
    ifName: 'wifi'
};

export const BLE = Template.bind({});
BLE.args = {
    name:'ANT+HR 123',
    value: '77',
    connectState: 'connected' ,
    ifName: 'ble'
};

export const Ant = Template.bind({});
Ant.args = {
    name:'ANT+HR 123',
    value: '77',
    connectState: 'connected' ,
    ifName: 'ant'
};

export const LongText = Template.bind({});
LongText.args = {
    name:'ANT+HR 123456789',
    value: '77',
    connectState: 'connecting' 
};

export const NoValue = Template.bind({});
NoValue.args = {
    name:'ANT+HR 123456789',
    connectState: 'connecting' 
};