import React from 'react';

import {CheckBox} from './index';

export default {
  component: CheckBox,
  title: 'Atoms/Input/CheckBox',
  argTypes: { onClicked: { action: 'clicked ' } },
};


const Template = args => <CheckBox {...args} />;

export const Default = Template.bind({});
Default.args = {
    label:'Click Me'
};

export const LargeFont = Template.bind({});
LargeFont.args = {
    label:'Click Me',
    fontSize: '4vh'
};
