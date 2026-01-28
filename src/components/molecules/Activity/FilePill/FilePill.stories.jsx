import React from 'react';

import {FilePill} from './FilePill';
import { Row } from '../../../atoms';



export default {
  component: FilePill,
  title: 'Molecules/Activities/FilePill',
  argTypes: { 
    onOpen: { action: 'open' } , 
    onCreate: { action: 'create' },
  }
};

const Template = args => <FilePill {...args} />;

export const Default = Template.bind({});
Default.args = {
    text:'Export',
    color:'green', textColor:'white', size:'large',
    canCreate:true,
    canOpen:true

};


export const OnlyOpen = Template.bind({});
OnlyOpen.args = {
    text:'Export',
    color:'green', textColor:'white', size:'large',
    canOpen:true

};


export const OnlySync = Template.bind({});
OnlySync.args = {
    text:'Export',
    color:'green', textColor:'white', size:'large',
    canCreate:true,

};

export const None = Template.bind({});
None.args = {
    text:'Export',
    color:'green', textColor:'white', size:'large',

};

export const Loading = Template.bind({});
Loading.args = {
    text:'Export',
    color:'green', textColor:'white', size:'large',
    loading:true,
    canCreate:true,
    canOpen:true
};


const Multiple = args => <Row>
    <FilePill {...args} />
    <FilePill {...args} />
    <FilePill {...args} />
</Row>;

export const Three = Multiple.bind({});
Three.args = {
    text:'Export',
    color:'green', 
    textColor:'white', 
    size:'large',
    canCreate:true,
    canOpen:true
};
