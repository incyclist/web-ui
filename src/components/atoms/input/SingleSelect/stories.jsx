import React from 'react';

import {SingleSelect} from './index';
import { Column } from "../../layout/View";
import { Button } from '../../Buttons/Button';

export default {
  component: SingleSelect,
  title: 'Atoms/Input/SingleSelect',
  argTypes: { onChange: { action: 'changed ' } },
};


const Template = args => <Column><SingleSelect {...args} /><Button text="OK"/></Column>

export const Empty = Template.bind({});
Empty.args = {
    label:'Options'
};


export const PreFilled = Template.bind({});
PreFilled.args = {
    label:'Options',
    options: [ 'Option #1', 'Option #2', 'Option #3']
};

export const PreFilledSelected = Template.bind({});
PreFilledSelected.args = {
    label:'Options',
    selected:'Option #2',
    options: [ 'Option #1', 'Option #2', 'Option #3']
};

export const Before= Template.bind({});
Before.args = {
    label:'Options',
    options: [ 'Option #1', 'Option #2', 'Option #3'],
    labelPosition: 'before'
};

export const After = Template.bind({});
After.args = {
    label:'Options',
    options: [ 'Option #1', 'Option #2', 'Option #3'],
    labelPosition: 'after'
};

