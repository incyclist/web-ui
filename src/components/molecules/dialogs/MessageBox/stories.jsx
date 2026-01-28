import React from 'react';

import {MessageBox} from './index';
import {Row} from '../../../atoms';

export default {
  component: MessageBox,
  title: 'molecules/Dialogs/MessageBox',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <MessageBox {...args} />;

const WithChildrenTemplate = args => <MessageBox> <Row width='100%' color='white'> some text</Row> </MessageBox>;

export const Default = Template.bind({});
Default.args = {
    text:'This is a message'
};

export const Center = Template.bind({});
Center.args = {
    center: true,
    text:'This is a message'
};

export const NoYes = Template.bind({});
NoYes.args = {
    text:'This is a message',
    noYes:true
};

export const NoNo = Template.bind({});
NoNo.args = {
    text:'This is a message',
    noNo:true

};

export const WithChildren = WithChildrenTemplate.bind({});
WithChildren.args = {
};
