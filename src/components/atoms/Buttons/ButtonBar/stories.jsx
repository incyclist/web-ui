import React from 'react';

import {ButtonBar} from './index';
import { Button } from '../Button';

export default {
  component: ButtonBar,
  title: 'atoms/ButtonBar',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <ButtonBar {...args}>
    <Button text='Button1'></Button>
    <Button text='Button2'></Button>
    <Button text='Button3'></Button>
</ButtonBar>;

export const Default = Template.bind({});
Default.args = {    
};


export const Left = Template.bind({});
Left.args = {    
    justify:'left'
};

export const Center = Template.bind({});
Center.args = {    
    justify:'center'
};

export const Right = Template.bind({});
Right.args = {    
    justify:'right'
};


export const Background = Template.bind({});
Background.args = {    
    background:'red'
};

export const Sizing = Template.bind({});
Sizing.args = {    
    width:'300px',
    height:'100px'
};

