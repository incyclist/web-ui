import React from 'react';

import {FileLink} from './FileLink';

export default {
  component: FileLink,
  title: 'atoms/Links/FileLink',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <FileLink {...args} />;

export const Default = Template.bind({});
Default.args = {
    text:'Some Text',
    src:'./index.html'
};
