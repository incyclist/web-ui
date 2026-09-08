import React, { useState } from 'react';
import { SegmentedControl } from './index';

import AppTheme from '../../../theme';

AppTheme.select('default')

export default {
  component: SegmentedControl,
  title: 'Atoms/SegmentedControl',
};

const Template = args => {
  const [value, setValue] = useState(args.value)
  return <div style={{ background: '#2c3e50', padding: '2vh', color: 'white' }}>
    <SegmentedControl {...args} value={value} onValueChange={setValue} />
  </div>
};

export const Default = Template.bind({});
Default.args = {
  label: 'Terrain Smoothing',
  labelWidth: '10vw',
  options: [{ value: 0, label: 'Off' }, 1, 2, 3, 4, 5],
  value: 0
};

export const Selected = Template.bind({});
Selected.args = {
  label: 'Terrain Smoothing',
  labelWidth: '10vw',
  options: [{ value: 0, label: 'Off' }, 1, 2, 3, 4, 5],
  value: 3
};

export const NoLabel = Template.bind({});
NoLabel.args = {
  options: ['A', 'B', 'C'],
  value: 'B'
};
