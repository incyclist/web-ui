import React from 'react';

import {FlipCard} from './index';

export default {
  component: FlipCard,
  title: 'atoms/FlipCard',
  argTypes: { onFlipped: { action: 'flipped' } },
};

const Template = args => <FlipCard {...args}>
    <div style={ {background:'green'} } >Hello</div>
    <div style={ {background:'red'} } >World</div>
</FlipCard>;

export const Default = Template.bind({});
Default.args = {
    width: '300px',
    height: '600px',
    background: 'lightgrey',
    cardId:'Default',
    logData: { a:'str'}
};

export const Delay = Template.bind({});
Delay.args = {
    width: '300px',
    height: '600px',
    background: 'lightgrey',
    delay: 3000
};