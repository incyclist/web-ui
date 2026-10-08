import React from 'react';
import { Tooltip } from './index';
import { Button } from '../Buttons';

export default {
  component: Tooltip,
  title: 'atoms/Tooltip',
};

const Template = args => (
    <div style={{ padding: '60px' }}>
        <Tooltip {...args}>
            <Button text="Hover me" />
        </Tooltip>
    </div>
);

export const Default = Template.bind({});
Default.args = { text: 'Pick any spot on the map and ride the real roads from there' };

export const Narrow = Template.bind({});
Narrow.args = { text: 'A short tooltip', width: '150px' };
