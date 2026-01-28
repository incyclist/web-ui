import React from 'react';

import {Dropzone} from './index';

export default {
  component: Dropzone,
  title: 'molecules/Dropzone',
  argTypes: { onDrop: { action: 'dropped' } },
};


const Template = args => <Dropzone {...args} />;

export const Default = Template.bind({});
Default.args = {};


export const SizeNumeric = Template.bind({});
SizeNumeric.args = { height:200, width:800};

export const SizeString = Template.bind({});
SizeString.args = { width:'100%', height:'50%'};

export const Rlv = Template.bind({});
Rlv.args = { scheme:'rlv'};

export const Disabled = Template.bind({});
Disabled.args = { disabled:true};

export const WithBackground= Template.bind({});
WithBackground.args = { backgroundColor: 'red'};

export const WithBackgroundDisabled= Template.bind({});
WithBackgroundDisabled.args = { backgroundColor: 'red', disabled:true};

export const WithError= Template.bind({});
WithError.args = { error: 'Some Error happened'};

export const WithChildren= Template.bind({});
WithChildren.args = { textColor:'white', backgroundColor:'black', children: <div disabled={true}style={{width:100, height:20, backgroundColor:'blue'}}>Hallo</div>};

export const Electron = Template.bind({});
Electron.args = { electron:true};
