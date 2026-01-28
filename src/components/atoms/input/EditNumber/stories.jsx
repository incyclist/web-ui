import React from 'react';

import {EditNumber} from './index';
import { Column } from "../../layout/View";
import { Button } from '../../Buttons/Button';

export default {
  component: EditNumber,
  title: 'Atoms/Input/EditNumber',
  argTypes: { onValueChange: { action: 'changed ' } },
};


const Template = args => <Column><EditNumber {...args} /><Button text="OK"/></Column>

export const Empty = Template.bind({});
Empty.args = {
    label:'Enter a Number'
};


export const PreFilled = Template.bind({});
PreFilled.args = {
    label:'Enter a Number',
    value: 123
};


export const Before= Template.bind({});
Before.args = {
    label:'Enter a Number',
    value: 123,
    labelPosition: 'before'
};

export const After = Template.bind({});
After.args = {
    label:'Enter a Number',
    value: 123,
    labelPosition: 'after'
};

export const MinValue = Template.bind({});
MinValue.args = {
    label:'Enter a Number',
    value: 123,
    min:100    
};

export const MaxValue = Template.bind({});
MaxValue.args = {
    label:'Enter a Number',
    value: 123,
    max:2000    
};

export const MinAndMaxValue = Template.bind({});
MinAndMaxValue.args = {
    label:'Enter a Number',
    value: 123,
    min:200,
    max:2000,
    size:3
};
