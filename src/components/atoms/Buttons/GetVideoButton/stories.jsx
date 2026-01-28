import React from 'react';
import { GetVideoButton } from './index';

export default {
  component: GetVideoButton,
  title: 'Atoms/GetVideoButton',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <GetVideoButton {...args} />;

export const Default = Template.bind({});
Default.args = {
  url: 'htttps://incyclist.com'
};
