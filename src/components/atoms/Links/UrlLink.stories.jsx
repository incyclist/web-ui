import React from 'react';

import {UrlLink} from './UrlLink';

export default {
  component: UrlLink,
  title: 'atoms/Links/UrlLink',
  argTypes: { onClick: { action: 'clicked' } },
};

const Template = args => <UrlLink {...args} />;

export const Default = Template.bind({});
Default.args = {
    text:'Some Text',
    url:'https:/incyclist.com'
};
