import React from 'react';

import {Button} from './index';

export default {
  component: Button,
  title: 'atoms/Button',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <Button {...args} />;

export const Default = Template.bind({});
Default.args = {
    text:'OK'
};

export const Primary = Template.bind({});
Primary.args = {
    text:'OK',
    primary: true
};

export const Secondary = Template.bind({});
Secondary.args = {
    text:'OK',
    secondary: true
};

export const Disabled = Template.bind({});
Disabled.args = {
    text:'OK',
    disabled:true
};

export const LongPress = Template.bind({});
LongPress.args = {
    text:'OK',
    longPressDelay: 500
};
