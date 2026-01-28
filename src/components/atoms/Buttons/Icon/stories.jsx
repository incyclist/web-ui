import React from 'react';

import {Icon} from './index';
import { RouteIcon } from '../../Icons';

export default {
  component: Icon,
  title: 'atoms/Icon',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <Icon {...args} />;

const IconTemplate = args => <Icon {...args}><RouteIcon fill={args.fill}  /></Icon>;

export const Default = Template.bind({});

Default.args = {
    width:100,
    height:60,
    image:'images/route.svg',
    label:'Route',
    fill:'black',
    background:'red '
};

export const White = Template.bind({});
White.args = {
    width:100,
    height:60,
    image:'images/route.svg',
    label:'route',
    fill:'white',
    
    background:'red '
};

export const IconWhite = IconTemplate.bind({});
IconWhite.args = {
    width:100,
    height:70,
    label:'Route',
    color:'white',
    
    background:'red '
};


export const WorkoutWhite = IconTemplate.bind({});
WorkoutWhite.args = {
    width:100,
    height:70,
    label:'Workout',
    color:'white',
    
    background:'red '
};
