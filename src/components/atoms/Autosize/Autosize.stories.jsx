import React from 'react';
import {Autosize} from './Autosize';

export default {
  component: Autosize,
  title: 'Atoms/Autosize',
  argTypes: { onResize: { action: 'event' } },
};


const Child = ({width, height}) => {
    return <div style={ {width:`${width}px`, height:`${height}px`, background:'red'}} >{`width:${width}px height:${height}px`}</div>
}


const Template = args => <Autosize {...args} ><Child/></Autosize>

export const Default = Template.bind({});
Default.args = {
};

export const WidthAndHeight = Template.bind({});
WidthAndHeight.args = {
    width:'50%', 
    height:'50%'
};

export const WidthAndHeightinPx = Template.bind({});
WidthAndHeightinPx.args = {
    width:'800px', 
    height:'600px'
};
