import React from 'react';

import {UploadPill} from './UploadPill';
import { Row } from '../../../atoms';



export default {
  component: UploadPill,
  title: 'Molecules/Activities/UploadPill',
  argTypes: { 
    onOpen: { action: 'open' } , 
    onSynchronize: { action: 'sync' },
  }
};

const Template = args => <UploadPill {...args} />;

export const Default = Template.bind({});
Default.args = {
    text:'Upload',
    color:'green', textColor:'white', size:'large',
    canSynchronize:true,
    canOpen:true

};

export const Loading = Template.bind({});
Loading.args = {
    text:'Upload',
    color:'green', textColor:'white', size:'large',
    loading:true,
    canSynchronize:true,
    canOpen:true
};


const Multiple = args => <Row>
    <UploadPill {...args} />
    <UploadPill {...args} />
    <UploadPill {...args} />
</Row>;

export const Three = Multiple.bind({});
Three.args = {
    text:'Upload',
    color:'green', 
    textColor:'white', 
    size:'large',
    canSynchronize:true,
    canOpen:true
};
