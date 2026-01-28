import React from 'react';
import { Pill } from './index';

import AppTheme from '../../../theme';

AppTheme.select('default')

export default {
  component: Pill,
  title: 'Atoms/Pill',
};

const Template = args => <Pill {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: 'green',
  text: 'Demo'
};

export const Small = Template.bind({});
Small.args = {
  color: 'green',
  text: 'Demo',
  size: 'small'
};

export const Medium = Template.bind({});
Medium.args = {
  color: 'green',
  text: 'Demo',
  size: 'medium'
};

export const Large = Template.bind({});
Large.args = {
  color: 'green',
  text: 'Demo',
  size: 'large'
};

export const FontWidth = Template.bind({});
FontWidth.args = {
  color: 'green',
  text: 'Demo',
  fontWidth: '24px'

};

export const textColor = Template.bind({});
textColor.args = {
  color: 'green',
  text: 'Demo',
  textColor: 'white',
};

export const success = Template.bind({});
success.args = {
  status:'success',
  text: 'Success', 
};


export const error = Template.bind({});
error.args = {
  status:'error',
  text: 'Error', 
};

export const Warning = Template.bind({});
Warning.args = {
  status:'warning',
  text: 'Warning', 
};

export const Incomplete = Template.bind({});
Incomplete.args = {
  status:'incomplete',
  text: 'Incomplete', 
};

export const Info = Template.bind({});
Info.args = {
  status:'info',
  text: 'Info', 
};


