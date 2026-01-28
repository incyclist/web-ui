import React from 'react';
import { ProgressBar } from './component';

export default {
  component: ProgressBar,
  title: 'Atoms/ProgressBar',
};

const Template = args => <ProgressBar {...args} />;

export const Default = Template.bind({});
Default.args = {
  color: 'blue',
  textColor: 'white',
  completed: 50
};


export const Width = Template.bind({});
Width.args = {
  color: 'blue',
  textColor: 'yellow',
  completed: 50,
  width: '200px'
};
