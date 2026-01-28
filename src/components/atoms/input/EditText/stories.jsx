import React from 'react';

import {EditText} from './index';
import { Column } from "../../layout/View";
import { Button } from '../../Buttons/Button';

export default {
  component: EditText,
  title: 'Atoms/Input/EditText',
  argTypes: { 
    onChange: { action: 'changed ' } ,
    onTimeout: { action: 'timeout ' } 
  },
};


const Template = args => <Column><EditText {...args} /><Button text="OK"/></Column>

export const Empty = Template.bind({});
Empty.args = {
    label:'Enter a Text'
};


export const Timeout = Template.bind({});
Timeout.args = {
    label:'Enter a Text',
    timeout: 500
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
