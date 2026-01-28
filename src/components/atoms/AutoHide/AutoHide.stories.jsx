import React from 'react';
import {AutoHide} from './AutoHide';
import { Button } from '../Buttons';

export default {
  component: AutoHide,
  title: 'Atoms/AutoHide',
  argTypes: { onChangeVisible: { action: 'changeVisible' } },
};


const TemplateSingleChild = args => <AutoHide {...args} ><Button text='test' /></AutoHide>
const TemplateNoChild = args => <AutoHide {...args} />
const TemplateMultipleChildren = args => <AutoHide {...args} ><Button text='test1'/><Button text='test2'/></AutoHide>

export const Default = TemplateSingleChild.bind({});
Default.args = {
};


export const Delay1s = TemplateSingleChild.bind({});
Delay1s.args = {
    delay: 1000,
};

export const Pinned = TemplateSingleChild.bind({});
Pinned.args = {
    delay: 1000,
    pinned: true
};

export const NoChild = TemplateNoChild.bind({});
NoChild.args = {
};

export const MulipleChildren = TemplateMultipleChildren.bind({});
MulipleChildren.args = {
    delay:3000
};
