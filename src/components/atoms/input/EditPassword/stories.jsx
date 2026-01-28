import React from 'react';

import {EditPassword} from './index';
import { Column } from "../../layout/View";
import { Button } from '../../Buttons/Button';

export default {
  component: EditPassword,
  title: 'Atoms/Input/EditPassword',
  argTypes: { onValueChange: { action: 'changed ' } },
};


const Template = args => <Column><EditPassword {...args} /><Button text="OK"/></Column>

export const Empty = Template.bind({});
Empty.args = {
    label:'Enter a Text'
};


export const PreFilled = Template.bind({});
PreFilled.args = {
    label:'Enter a Text',
    value: 'some text'
};


export const Before= Template.bind({});
Before.args = {
    label:'Enter a Text',
    value: 'some text',
    labelPosition: 'before'
};

export const After = Template.bind({});
After.args = {
    label:'Enter a Text',
    value: 'some text',
    labelPosition: 'after'
};

export const Error = Template.bind({});
Error.args = {
    label:'Type `error` to simulate error',
    value: 'some text',    
    validate: (value)=> value==='error' ? 'Text is `error`' : null
};
